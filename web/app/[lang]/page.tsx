import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { SearchBox } from "@/components/SearchBox";
import { Unavailable } from "@/components/Unavailable";
import { tryApiGet } from "@/lib/api";
import { categoryLabel, t } from "@/lib/i18n";
import { parseLocale } from "@/lib/locale";
import { pageAlternates } from "@/lib/seo";
import type { Product } from "@/lib/types";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).lang);
  const dict = t(locale);
  return {
    title: locale === "ar" ? "أسعار المواد في تونس" : "Prix des produits en Tunisie",
    description: dict.description,
    alternates: pageAlternates(locale, ""),
  };
}

export default async function HomePage({ params }: Props) {
  const locale = parseLocale((await params).lang);
  const dict = t(locale);
  const { data: products, failed } = await tryApiGet<Product[]>("/products", 300);
  const categories = Array.from(new Set((products ?? []).map((p) => p.category)));

  return (
    <div className="space-y-7">
      <section className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold leading-snug text-neutral-900">{dict.home.title}</h1>
          <p className="text-sm text-neutral-600">{dict.tagline}</p>
        </div>
        <SearchBox locale={locale} />
      </section>

      {categories.length > 0 && (
        <section aria-label={dict.home.categories} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {categories.map((c) => (
            <Link
              key={c}
              href={`/${locale}/search?category=${encodeURIComponent(c)}`}
              className="shrink-0 rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-sm hover:border-brand hover:text-brand"
            >
              {categoryLabel(c, locale)}
            </Link>
          ))}
        </section>
      )}

      <section aria-labelledby="popular" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="popular" className="text-lg font-semibold">
            {dict.home.products}
          </h2>
          <Link href={`/${locale}/search`} className="text-sm text-brand hover:underline">
            {dict.home.seeAll}
          </Link>
        </div>
        {failed ? (
          <Unavailable locale={locale} />
        ) : (
          <div className="grid gap-2.5">
            {(products ?? []).slice(0, 12).map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl bg-brand-soft p-5 text-sm text-emerald-950">
        <h2 className="mb-1 font-semibold">{dict.home.newPriceTitle}</h2>
        <p className="mb-3">{dict.home.newPriceText}</p>
        <Link
          href={`/${locale}/submit`}
          className="inline-flex h-10 items-center rounded-lg bg-brand px-4 font-semibold text-white hover:bg-emerald-800"
        >
          {dict.home.addPrice}
        </Link>
      </section>
    </div>
  );
}
