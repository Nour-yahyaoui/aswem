import Link from "next/link";
import { fill, t, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export function SiteFooter({ locale }: { locale: Locale }) {
  const dict = t(locale);
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white pb-24 md:pb-6">
      <div className="mx-auto max-w-3xl space-y-2 px-4 py-6 text-sm text-neutral-600 sm:px-6 md:max-w-5xl">
        <p>{fill(dict.footer.free, { name: dict.brand })}</p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            {dict.footer.builtBy} <strong className="text-neutral-900">{SITE.author}</strong>
          </span>
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-text underline-offset-4 hover:underline"
            dir="ltr"
          >
            GitHub: Nour-yahyaoui
          </a>
          <a href={`tel:${SITE.phoneTel}`} className="text-brand-text underline-offset-4 hover:underline" dir="ltr">
            {SITE.phoneDisplay}
          </a>
        </p>
        <p className="text-xs text-neutral-500">
          <Link href={`/${locale}/about`} className="underline-offset-4 hover:underline">
            {dict.footer.about}
          </Link>
          {" · "}
          <Link href={`/${locale}/status`} className="underline-offset-4 hover:underline">
            {dict.ui.statusLink}
          </Link>
          {" · "}
          <a href={SITE.repo} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
            {dict.footer.sourceCode}
          </a>
        </p>
      </div>
    </footer>
  );
}
