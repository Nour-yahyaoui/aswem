"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { clientIpFrom } from "@/lib/client-ip";
import { DEFAULT_LOCALE, isLocale, t, type Locale } from "@/lib/i18n";

export type SubmitState =
  | { status: "idle" }
  | { status: "ok"; productSlug: string }
  | { status: "error"; message: string };

const MIN_MILLIMES = 100;
const MAX_MILLIMES = 10_000_000;
const MAX_ADDRESS = 120;

/**
 * Validates a community price report and forwards it to the API.
 * Runs only on the server, so the API token never reaches the browser.
 */
export async function submitPrice(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  const langValue = String(formData.get("lang") ?? "");
  const locale: Locale = isLocale(langValue) ? langValue : DEFAULT_LOCALE;
  const e = t(locale).submit.errors;
  const fail = (message: string): SubmitState => ({ status: "error", message });

  // Honeypot: real users never fill this hidden field.
  if (String(formData.get("website") ?? "") !== "") return fail(e.honeypot);

  const productId = Number(formData.get("product_id"));
  const governorateId = Number(formData.get("governorate_id"));
  const productSlug = String(formData.get("product_slug") ?? "");
  if (!Number.isInteger(productId) || productId <= 0) return fail(e.product);
  if (!Number.isInteger(governorateId) || governorateId <= 0) return fail(e.governorate);

  const priceText = String(formData.get("price") ?? "").trim().replace(",", ".");
  const price = Number(priceText);
  if (priceText === "" || !Number.isFinite(price) || price <= 0) return fail(e.priceInvalid);
  const millimes = Math.round(price * 1000);
  if (millimes < MIN_MILLIMES || millimes > MAX_MILLIMES) return fail(e.priceRange);

  const address = String(formData.get("address") ?? "").trim();
  if (address.length > MAX_ADDRESS) return fail(e.placeTooLong);

  const latText = String(formData.get("lat") ?? "");
  const lngText = String(formData.get("lng") ?? "");
  const lat = latText === "" ? null : Number(latText);
  const lng = lngText === "" ? null : Number(lngText);
  if ((lat === null) !== (lng === null)) return fail(e.locationPartial);
  if (!address && lat === null) return fail(e.placeOrLocation);

  const apiUrl = process.env.API_URL;
  const token = process.env.SUBMIT_TOKEN;
  if (!apiUrl || !token) return fail(e.unavailable);

  const h = await headers();
  const clientIp = clientIpFrom(h.get("x-forwarded-for"));

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
    return fail(e.network);
  }

  if (res.status === 201) {
    if (productSlug) revalidatePath(`/${locale}/products/${productSlug}`);
    return { status: "ok", productSlug };
  }
  if (res.status === 429) return fail(e.rateLimited);
  if (res.status === 400) return fail(e.badRequest);
  return fail(e.generic);
}
