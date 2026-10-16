import type { MetadataRoute } from "next";
import { tryApiGet } from "@/lib/api";
import { LOCALES } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import type { Product } from "@/lib/types";

export const revalidate = 3600;

const STATIC_PATHS: { path: string; changeFrequency: "daily" | "weekly" | "monthly"; priority: number }[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/search", changeFrequency: "daily", priority: 0.7 },
  { path: "/submit", changeFrequency: "weekly", priority: 0.5 },
  { path: "/about", changeFrequency: "monthly", priority: 0.3 },
];

/** Each URL lists its translations so search engines can pick the right language. */
function alternatesFor(path: string): Record<string, string> {
  return {
    "ar-TN": `${SITE.url}/ar${path}`,
    "fr-TN": `${SITE.url}/fr${path}`,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const { path, changeFrequency, priority } of STATIC_PATHS) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${SITE.url}/${locale}${path}`,
        changeFrequency,
        priority,
        alternates: { languages: alternatesFor(path) },
      });
    }
  }

  const { data } = await tryApiGet<Product[]>("/products", 3600);
  for (const product of data ?? []) {
    const path = `/products/${product.slug}`;
    for (const locale of LOCALES) {
      entries.push({
        url: `${SITE.url}/${locale}${path}`,
        changeFrequency: "daily",
        priority: 0.9,
        alternates: { languages: alternatesFor(path) },
      });
    }
  }

  return entries;
}
