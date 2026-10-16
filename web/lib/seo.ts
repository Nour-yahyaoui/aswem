import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

/**
 * Canonical and hreflang alternates for a page that exists in every language.
 * `path` is the part after the locale prefix, for example "" or "/search".
 */
export function pageAlternates(locale: Locale, path: string) {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      "ar-TN": `/ar${path}`,
      "fr-TN": `/fr${path}`,
      "x-default": `/${DEFAULT_LOCALE}${path}`,
    },
  };
}
