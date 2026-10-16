import type { Metadata } from "next";
import { SubmitForm } from "@/components/SubmitForm";
import { Unavailable } from "@/components/Unavailable";
import { tryApiGet } from "@/lib/api";
import { parseLocale } from "@/lib/locale";
import { productName, t } from "@/lib/i18n";
import { pageAlternates } from "@/lib/seo";
import type { Governorate, Product } from "@/lib/types";

export const revalidate = 3600;

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ product?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).lang);
  const dict = t(locale);
  return {
    title: dict.submit.title,
    description: dict.submit.metaDescription,
    alternates: pageAlternates(locale, "/submit"),
  };
}

export default async function SubmitPage({ params, searchParams }: Props) {
  const locale = parseLocale((await params).lang);
  const dict = t(locale);
  const { product } = await searchParams;

  const [productsRes, govsRes] = await Promise.all([
    tryApiGet<Product[]>("/products", 300),
    tryApiGet<Governorate[]>("/governorates", 86400),
  ]);

  const products = [...(productsRes.data ?? [])].sort((a, b) =>
    productName(a, locale).localeCompare(productName(b, locale), locale),
  );
  const governorates = [...(govsRes.data ?? [])].sort((a, b) => a.name_latin.localeCompare(b.name_latin));
  const defaultProductId = products.find((p) => p.slug === product)?.id;

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{dict.submit.title}</h1>
        <p className="text-sm text-neutral-600">{dict.submit.subtitle}</p>
      </header>

      {productsRes.failed || govsRes.failed ? (
        <Unavailable locale={locale} />
      ) : (
        <SubmitForm
          locale={locale}
          products={products}
          governorates={governorates}
          defaultProductId={defaultProductId}
        />
      )}
    </div>
  );
}
