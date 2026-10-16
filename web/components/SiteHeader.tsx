import Link from "next/link";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { t, type Locale } from "@/lib/i18n";

export function SiteHeader({ locale }: { locale: Locale }) {
  const dict = t(locale);
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
        <Link href={`/${locale}`} className="text-xl font-bold text-brand">
          {dict.brand}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500" dir="ltr">
            {dict.brandLatin}
          </span>
          <LanguageSwitch current={locale} />
        </div>
      </div>
    </header>
  );
}
