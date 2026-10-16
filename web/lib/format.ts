import { SITE } from "@/lib/site";
import { t, type Locale } from "@/lib/i18n";

/** Formats integer millimes (1 TND = 1000 millimes) for the given language. */
export function formatTnd(millimes: number, locale: Locale): string {
  const value = (millimes / 1000).toFixed(3);
  return locale === "ar" ? `${value} د.ت` : `${value.replace(".", ",")} DT`;
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(t(locale).dateLocale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: SITE.timeZone,
  }).format(new Date(iso));
}
