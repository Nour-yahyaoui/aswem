import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { SearchBox } from "@/components/SearchBox";
import { Unavailable } from "@/components/Unavailable";
import { tryApiGet } from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/site";
import type { Product } from "@/lib/types";
import Link from "next/link";

type Props = { searchParams: Promise<{ q?: string; category?: string }> };

function clean(value: string | undefined): string {
  return (value ?? "").trim().slice(0, 80);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, category } = await searchParams;
  const query = clean(q);
  const title = query ? `نتائج البحث: ${query}` : category ? `${CATEGORY_LABELS[category] ?? category}` : "بحث عن المواد";
  return {
    title,
    alternates: { canonical: "/search" },
    // Query-specific result pages are thin; keep them out of the index.
    robots: { index: !query, follow: true },
  };
}

export default async function SearchPage({ searchParams }: Props) {
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
      <h1 className="text-2xl font-bold">بحث</h1>
      <SearchBox defaultValue={query} />

      {failed ? (
        <Unavailable />
      ) : products && products.length > 0 ? (
        <div className="grid gap-2.5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-center">
          <p className="font-semibold">ما لقيناش المادة هذي</p>
          <p className="mt-1 text-sm text-neutral-600">جرب كلمة أخرى، ولا زيد الثمن وخلي الجماعة تلقاها.</p>
          <Link href="/submit" className="mt-4 inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white">
            زيد ثمن
          </Link>
        </div>
      )}
    </div>
  );
}
