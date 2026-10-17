import type { Metadata } from "next";
import { ListPlanner } from "@/components/ListPlanner";
import { Unavailable } from "@/components/Unavailable";
import { tryApiGet } from "@/lib/api";
import { t } from "@/lib/i18n";
import { parseLocale } from "@/lib/locale";
import { pageAlternates } from "@/lib/seo";
import type { Governorate, Product } from "@/lib/types";

// Render per request so a build-time API outage is never frozen into the page.
// The API calls below are still cached for five minutes by the fetch cache.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).lang);
  const dict = t(locale).ui.list;
  return {
    title: dict.title,
    description: dict.intro,
    alternates: pageAlternates(locale, "/list"),
  };
}

export default async function ListPage({ params }: Props) {
  const locale = parseLocale((await params).lang);
  const [productsRes, govsRes] = await Promise.all([
    tryApiGet<Product[]>("/products", 300),
    tryApiGet<Governorate[]>("/governorates", 86400),
  ]);
  if (productsRes.failed || govsRes.failed || !productsRes.data || !govsRes.data) {
    return <Unavailable locale={locale} />;
  }
  return <ListPlanner locale={locale} products={productsRes.data} governorates={govsRes.data} />;
}
