import "server-only";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";

/** Validates the [lang] route segment. Unknown languages render 404. */
export function parseLocale(value: string): Locale {
  if (!isLocale(value)) notFound();
  return value;
}
