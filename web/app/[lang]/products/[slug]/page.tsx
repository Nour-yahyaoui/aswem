import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Unavailable } from "@/components/Unavailable";
import { tryApiGet } from "@/lib/api";
import { categoryLabel, fill, governorateName, productName, t, type Locale } from "@/lib/i18n";
import { formatDate, formatTnd } from "@/lib/format";
import { parseLocale } from "@/lib/locale";
import { jsonLd } from "@/lib/jsonld";
import { pageAlternates } from "@/lib/seo";
import { SITE } from "@/lib/site";
import type { Governorate, GovStat, PriceReport, Product, ProductPrices } from "@/lib/types";

export const revalidate = 120;

type Props = { params: Promise<{ lang: string; slug: string }> };

type Loaded = {
  product: Product;
  prices: ProductPrices | null;
  govs: Map<number, Governorate>;
};

async function load(slug: string): Promise<{ loaded: Loaded | null; failed: boolean }> {
  const [productRes, pricesRes, govRes] = await Promise.all([
    tryApiGet<Product>(`/products/${encodeURIComponent(slug)}`, 300),
    tryApiGet<ProductPrices>(`/products/${encodeURIComponent(slug)}/prices`, 120),
    tryApiGet<Governorate[]>("/governorates", 86400),
  ]);
  if (productRes.failed || pricesRes.failed || govRes.failed) return { loaded: null, failed: true };
  if (!productRes.data) return { loaded: null, failed: false };
  return {
    failed: false,
    loaded: {
      product: productRes.data,
      prices: pricesRes.data,
      govs: new Map((govRes.data ?? []).map((g) => [g.id, g])),
    },
  };
}

function cheapest(stats: GovStat[]): GovStat | undefined {
  return stats.reduce<GovStat | undefined>(
    (best, s) => (!best || s.median_millimes < best.median_millimes ? s : best),
    undefined,
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = parseLocale(lang);
  const dict = t(locale);
  const { loaded } = await load(slug);
  if (!loaded) return { title: dict.product.notFound, robots: { index: false } };

  const { product, prices, govs } = loaded;
  const name = productName(product, locale);
  const best = prices ? cheapest(prices.by_governorate) : undefined;
  const title = fill(dict.product.metaTitle, { name });
  const description = best
    ? fill(dict.product.metaBest, {
        name,
        price: formatTnd(best.median_millimes, locale),
        gov: governorateName(govs.get(best.governorate_id) ?? { name_ar: "", name_latin: "Tunisie" }, locale),
      })
    : fill(dict.product.metaNoData, { name });

  return {
    title,
    description,
    alternates: pageAlternates(locale, `/products/${product.slug}`),
    keywords: [product.name_ar, product.name_latin, `prix ${product.name_latin} Tunisie`, `سعر ${product.name_ar}`],
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_TN" : "fr_TN",
      siteName: dict.brand,
      url: `${SITE.url}/${locale}/products/${product.slug}`,
      title,
      description,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function ProductPage({ params }: Props) {
  const { lang, slug } = await params;
  const locale: Locale = parseLocale(lang);
  const dict = t(locale);
  const { loaded, failed } = await load(slug);

  if (failed) return <Unavailable locale={locale} />;
  if (!loaded) notFound();

  const { product, prices, govs } = loaded;
  const name = productName(product, locale);
  const category = categoryLabel(product.category, locale);
  const stats = prices?.by_governorate ?? [];
  const recent: PriceReport[] = prices?.recent ?? [];
  const best = cheapest(stats);
  const totalSamples = stats.reduce((sum, s) => sum + s.samples, 0);
  const lastSeen = stats.reduce<string | undefined>(
    (latest, s) => (!latest || s.last_seen > latest ? s.last_seen : latest),
    undefined,
  );
  const govName = (id: number) => {
    const g = govs.get(id);
    return g ? governorateName(g, locale) : "—";
  };
  const url = `${SITE.url}/${locale}/products/${product.slug}`;

  const structured = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name_latin,
      alternateName: product.name_ar,
      category,
      inLanguage: locale === "ar" ? "ar-TN" : "fr-TN",
      url,
      ...(stats.length > 0 && {
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: SITE.currency,
          lowPrice: Math.min(...stats.map((s) => s.min_millimes)) / 1000,
          highPrice: Math.max(...stats.map((s) => s.max_millimes)) / 1000,
          offerCount: totalSamples,
          availability: "https://schema.org/InStock",
        },
      }),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: dict.brand, item: `${SITE.url}/${locale}` },
        { "@type": "ListItem", position: 2, name, item: url },
      ],
    },
  ];

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />

      <nav aria-label={dict.product.breadcrumbLabel} className="text-sm text-neutral-500">
        <Link href={`/${locale}`} className="hover:text-brand">
          {dict.product.breadcrumbHome}
        </Link>
        {" / "}
        <Link href={`/${locale}/search`} className="hover:text-brand">
          {dict.product.breadcrumbProducts}
        </Link>
      </nav>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{name}</h1>
        <p className="text-sm text-neutral-500">
          {locale === "ar" ? <span dir="ltr">{product.name_latin}</span> : product.name_ar} · {category}
        </p>
      </header>

      <section aria-label={dict.product.summary} className="grid grid-cols-3 gap-2.5 text-center">
        <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-neutral-200">
          <p className="text-xs text-neutral-500">{dict.product.cheapestMedian}</p>
          <p className="mt-1 text-base font-bold text-brand">
            {best ? formatTnd(best.median_millimes, locale) : "—"}
          </p>
          {best && <p className="text-xs text-neutral-500">{govName(best.governorate_id)}</p>}
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-neutral-200">
          <p className="text-xs text-neutral-500">{dict.product.reports}</p>
          <p className="mt-1 text-base font-bold">{totalSamples}</p>
          <p className="text-xs text-neutral-500">{dict.product.last30Days}</p>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-neutral-200">
          <p className="text-xs text-neutral-500">{dict.product.lastUpdate}</p>
          <p className="mt-1 text-xs font-semibold">{lastSeen ? formatDate(lastSeen, locale) : "—"}</p>
        </div>
      </section>

      {stats.length > 0 ? (
        <section aria-labelledby="by-gov" className="space-y-2">
          <h2 id="by-gov" className="text-lg font-semibold">
            {dict.product.byGovernorate}
          </h2>
          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <th scope="col" className="px-3 py-2.5 text-start font-medium">{dict.product.governorate}</th>
                  <th scope="col" className="px-3 py-2.5 text-start font-medium">{dict.product.median}</th>
                  <th scope="col" className="px-3 py-2.5 text-start font-medium">{dict.product.min}</th>
                  <th scope="col" className="px-3 py-2.5 text-start font-medium">{dict.product.count}</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.governorate_id} className="border-t border-neutral-100">
                    <th scope="row" className="px-3 py-2.5 text-start font-medium">
                      {govName(s.governorate_id)}
                    </th>
                    <td className="px-3 py-2.5 tabular-nums">{formatTnd(s.median_millimes, locale)}</td>
                    <td className="px-3 py-2.5 tabular-nums">{formatTnd(s.min_millimes, locale)}</td>
                    <td className="px-3 py-2.5 tabular-nums">{s.samples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-5 text-sm text-neutral-600">
          {dict.product.noData}
        </p>
      )}

      {recent.length > 0 && (
        <section aria-labelledby="recent" className="space-y-2">
          <h2 id="recent" className="text-lg font-semibold">
            {dict.product.recent}
          </h2>
          <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">
                    {govName(r.governorate_id)}
                    {r.address ? ` · ${r.address}` : ""}
                  </p>
                  <p className="text-xs text-neutral-500">{formatDate(r.created_at, locale)}</p>
                </div>
                <p className="shrink-0 font-semibold tabular-nums">{formatTnd(r.price_millimes, locale)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href={`/${locale}/submit?product=${encodeURIComponent(product.slug)}`}
        className="flex h-12 items-center justify-center rounded-xl bg-brand text-base font-semibold text-white shadow-sm hover:bg-emerald-800"
      >
        {fill(dict.product.addPriceFor, { name })}
      </Link>
    </article>
  );
}
