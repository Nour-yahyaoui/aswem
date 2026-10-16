import type { Metadata } from "next";
import { parseLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { pageAlternates } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).lang);
  const dict = t(locale);
  return {
    title: dict.about.title,
    description: dict.about.metaDescription,
    alternates: pageAlternates(locale, "/about"),
  };
}

export default async function AboutPage({ params }: Props) {
  const locale = parseLocale((await params).lang);
  const dict = t(locale).about;

  return (
    <article className="space-y-5 leading-relaxed text-neutral-800">
      <h1 className="text-2xl font-bold">{dict.title}</h1>
      <p>{dict.intro}</p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">{dict.howTitle}</h2>
        <ul className="list-disc space-y-1 ps-5 text-sm">
          {dict.how.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">{dict.privacyTitle}</h2>
        <ul className="list-disc space-y-1 ps-5 text-sm">
          {dict.privacy.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">{dict.contactTitle}</h2>
        <p className="text-sm">
          {dict.builtBy} <strong>{SITE.author}</strong>.{" "}
          <a href={SITE.github} target="_blank" rel="noopener noreferrer" className="text-brand-text underline underline-offset-4" dir="ltr">
            GitHub: Nour-yahyaoui
          </a>{" "}
          ·{" "}
          <a href={`tel:${SITE.phoneTel}`} className="text-brand-text underline underline-offset-4" dir="ltr">
            {SITE.phoneDisplay}
          </a>
        </p>
        <p className="text-sm">
          {dict.sourceCode}{" "}
          <a href={SITE.repo} target="_blank" rel="noopener noreferrer" className="text-brand-text underline underline-offset-4">
            GitHub
          </a>
          .
        </p>
      </section>
    </article>
  );
}
