"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { otherLocale, t, type Locale } from "@/lib/i18n";

/** Switches language and keeps the visitor on the same page. */
export function LanguageSwitch({ current }: { current: Locale }) {
  const pathname = usePathname();
  const target = otherLocale(current);
  const rest = pathname.replace(new RegExp(`^/${current}(?=/|$)`), "");

  return (
    <Link
      href={`/${target}${rest}`}
      hrefLang={target === "ar" ? "ar-TN" : "fr-TN"}
      lang={target === "ar" ? "ar-TN" : "fr-TN"}
      className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium hover:border-brand hover:text-brand-text"
    >
      {t(target).languageName}
    </Link>
  );
}
