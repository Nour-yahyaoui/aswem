import type { Metadata } from "next";
import { StatusPanel } from "@/components/StatusPanel";
import { parseLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).lang);
  const dict = t(locale).ui.status;
  return {
    title: dict.title,
    robots: { index: false, follow: true },
    alternates: pageAlternates(locale, "/status"),
  };
}

export default async function StatusPage({ params }: Props) {
  const locale = parseLocale((await params).lang);
  const dict = t(locale).ui.status;
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{dict.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{dict.intro}</p>
      </header>
      <StatusPanel locale={locale} />
    </div>
  );
}
