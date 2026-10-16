"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type SubmitState =
  | { status: "idle" }
  | { status: "ok"; productSlug: string }
  | { status: "error"; message: string };

const MIN_MILLIMES = 100;
const MAX_MILLIMES = 10_000_000;
const MAX_ADDRESS = 120;

const fail = (message: string): SubmitState => ({ status: "error", message });

/**
 * Validates a community price report and forwards it to the API.
 * Runs only on the server, so the API token never reaches the browser.
 */
export async function submitPrice(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  // Honeypot: real users never fill this hidden field.
  if (String(formData.get("website") ?? "") !== "") {
    return fail("تعذر إرسال الثمن، عاود جرب.");
  }

  const productId = Number(formData.get("product_id"));
  const governorateId = Number(formData.get("governorate_id"));
  const productSlug = String(formData.get("product_slug") ?? "");
  if (!Number.isInteger(productId) || productId <= 0) return fail("اختار المادة.");
  if (!Number.isInteger(governorateId) || governorateId <= 0) return fail("اختار الولاية.");

  const priceText = String(formData.get("price") ?? "").trim().replace(",", ".");
  const price = Number(priceText);
  if (priceText === "" || !Number.isFinite(price) || price <= 0) return fail("الثمن ما هوش صحيح.");
  const millimes = Math.round(price * 1000);
  if (millimes < MIN_MILLIMES || millimes > MAX_MILLIMES) {
    return fail("الثمن برا المجال المسموح (من 0.100 إلى 10000 د.ت).");
  }

  const address = String(formData.get("address") ?? "").trim();
  if (address.length > MAX_ADDRESS) return fail("اسم المحل أو المنطقة طويل بزاف.");

  const latText = String(formData.get("lat") ?? "");
  const lngText = String(formData.get("lng") ?? "");
  const lat = latText === "" ? null : Number(latText);
  const lng = lngText === "" ? null : Number(lngText);
  if ((lat === null) !== (lng === null)) return fail("الموقع ناقص، عاود جرب.");
  if (!address && lat === null) return fail("زيد اسم المحل أو المنطقة، ولا استعمل موقعك.");

  const apiUrl = process.env.API_URL;
  const token = process.env.SUBMIT_TOKEN;
  if (!apiUrl || !token) return fail("الخدمة مش متوفرة توّا.");

  const h = await headers();
  const clientIp = (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";

  let res: Response;
  try {
    res = await fetch(`${apiUrl.replace(/\/$/, "")}/api/v1/prices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Aswem-Token": token,
        "X-Client-Ip": clientIp,
      },
      body: JSON.stringify({
        product_id: productId,
        governorate_id: governorateId,
        price_millimes: millimes,
        address: address || null,
        lat,
        lng,
      }),
      cache: "no-store",
    });
  } catch {
    return fail("الخدمة مش متوفرة توّا، عاود جرب بعد شوية.");
  }

  if (res.status === 201) {
    if (productSlug) revalidatePath(`/products/${productSlug}`);
    return { status: "ok", productSlug };
  }
  if (res.status === 429) return fail("بزاف تصاريح من الجهاز هذا، استنى شوية.");
  if (res.status === 400) return fail("المعلومات ماشي صحيحة، أو الثمن بعيد على المعدل. تأكد منها وعاود جرب.");
  return fail("صارت مشكلة، عاود جرب بعد شوية.");
}
