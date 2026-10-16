import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { SearchBox } from "@/components/SearchBox";
import { Unavailable } from "@/components/Unavailable";
import { tryApiGet } from "@/lib/api";
import { categoryLabel, fill, t } from "@/lib/i18n";
import { parseLocale } from "@/lib/locale";
import { pageAlternates } from "@/lib/seo";
import type { Product } from "@/lib/types";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
};

function clean(value: string | undefined): string {
  return (value ?? "").trim().slice(0, 80);
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).lang);
  const dict = t(locale);
  const { q, category } = await searchParams;
  const query = clean(q);
  const cat = clean(category);
  const title = query
    ? fill(dict.search.resultsTitle, { query })
    : cat
      ? categoryLabel(cat, locale)
      : dict.search.pageTitle;
  return {
    title,
    alternates: pageAlternates(locale, "/search"),
    // Query-specific result pages are thin content; keep them out of the index.
    robots: { index: !query, follow: true },
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const locale = parseLocale((await params).lang);
  const dict = t(locale);
  const { q, category } = await searchParams;
  const query = clean(q);
  const cat = clean(category);

  let path: string;
  if (query) {
    path = `/search?${new URLSearchParams({ q: query, limit: "50" })}`;
  } else if (cat) {
    path = `/products?${new URLSearchParams({ category: cat })}`;
  } else {
    path = "/products";
  }

  const { data: products, failed } = await tryApiGet<Product[]>(path, 60);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{dict.search.title}</h1>
      <SearchBox locale={locale} defaultValue={query} />

      {failed ? (
        <Unavailable locale={locale} />
      ) : products && products.length > 0 ? (
        <div className="grid gap-2.5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-center">
          <p className="font-semibold">{dict.search.notFoundTitle}</p>
          <p className="mt-1 text-sm text-neutral-600">{dict.search.notFoundText}</p>
          <Link
            href={`/${locale}/submit`}
            className="mt-4 inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white"
          >
            {dict.search.addPrice}
          </Link>
        </div>
      )}
    </div>
  );
}
