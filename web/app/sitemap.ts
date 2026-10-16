import type { MetadataRoute } from "next";
import { tryApiGet } from "@/lib/api";
import { SITE } from "@/lib/site";
import type { Product } from "@/lib/types";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/submit`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const { data } = await tryApiGet<Product[]>("/products", 3600);
  for (const product of data ?? []) {
    entries.push({
      url: `${base}/products/${product.slug}`,
      changeFrequency: "daily",
      priority: 0.9,
    });
  }
  return entries;
}
