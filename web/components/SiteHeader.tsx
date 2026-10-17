import Link from "next/link";
import { AboutButton } from "@/components/AboutButton";
import { DesktopNav } from "@/components/DesktopNav";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { t, type Locale } from "@/lib/i18n";

export function SiteHeader({ locale }: { locale: Locale }) {
  const dict = t(locale);
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link href={`/${locale}`} className="shrink-0 text-xl font-bold text-brand-text">
            {dict.brand}
          </Link>
          <DesktopNav locale={locale} />
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <span className="hidden text-xs text-neutral-500 lg:inline" dir="ltr">
            {dict.brandLatin}
          </span>
          <AboutButton locale={locale} />
          <LanguageSwitch current={locale} />
          <ThemeToggle locale={locale} />
        </div>
      </div>
    </header>
  );
}
