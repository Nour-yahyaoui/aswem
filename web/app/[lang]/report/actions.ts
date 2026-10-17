"use server";

import { headers } from "next/headers";
import { clientIpFrom } from "@/lib/client-ip";
import { DEFAULT_LOCALE, isLocale, t, type Locale } from "@/lib/i18n";

export type ReportState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string };

const REASONS = ["expired", "spoiled", "wrong_label", "other"] as const;
const MAX_NOTE = 300;

/** Validates a problem report and forwards it to the API. Runs only on the server. */
export async function submitReport(_prev: ReportState, formData: FormData): Promise<ReportState> {
  const langValue = String(formData.get("lang") ?? "");
  const locale: Locale = isLocale(langValue) ? langValue : DEFAULT_LOCALE;
  const e = t(locale).report.errors;
  const fail = (message: string): ReportState => ({ status: "error", message });

  // Honeypot: real users never fill this hidden field.
  if (String(formData.get("website") ?? "") !== "") return fail(e.honeypot);

  const productId = Number(formData.get("product_id"));
  const governorateId = Number(formData.get("governorate_id"));
  if (!Number.isInteger(productId) || productId <= 0) return fail(e.product);
  if (!Number.isInteger(governorateId) || governorateId <= 0) return fail(e.governorate);

  const reason = String(formData.get("reason") ?? "");
  if (!(REASONS as readonly string[]).includes(reason)) return fail(e.reason);

  const note = String(formData.get("note") ?? "").trim();
  if (note.length > MAX_NOTE) return fail(e.noteTooLong);

  const apiUrl = process.env.API_URL;
  const token = process.env.SUBMIT_TOKEN;
  if (!apiUrl || !token) return fail(e.unavailable);

  const h = await headers();
  const clientIp = clientIpFrom(h.get("x-forwarded-for"));

  let res: Response;
  try {
    res = await fetch(`${apiUrl.replace(/\/$/, "")}/api/v1/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Aswem-Token": token,
        "X-Client-Ip": clientIp,
      },
      body: JSON.stringify({
        product_id: productId,
        governorate_id: governorateId,
        reason,
        note: note || null,
      }),
      cache: "no-store",
    });
  } catch {
    return fail(e.network);
  }

  if (res.status === 201) return { status: "ok" };
  if (res.status === 429) return fail(e.rateLimited);
  if (res.status === 400) return fail(e.badRequest);
  return fail(e.generic);
}
