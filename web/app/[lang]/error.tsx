"use client";

import { useEffect } from "react";
import Link from "next/link";
import { t, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { useParams } from "next/navigation";

/** Shown when a page throws. The real error goes to the console, never to the visitor. */
export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ lang: string }>();
  const locale: Locale = params?.lang && isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
  const dict = t(locale).error;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="space-y-4 py-12 text-center">
      <h1 className="text-xl font-semibold">{dict.title}</h1>
      <p className="text-sm text-neutral-600">{dict.text}</p>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-on-brand hover:bg-emerald-800"
        >
          {dict.retry}
        </button>
        <Link href={`/${locale}`} className="inline-flex h-10 items-center rounded-lg border border-neutral-300 px-4 text-sm font-semibold">
          {dict.home}
        </Link>
      </div>
    </div>
  );
}
