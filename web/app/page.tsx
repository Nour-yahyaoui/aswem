import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { SearchBox } from "@/components/SearchBox";
import { Unavailable } from "@/components/Unavailable";
import { tryApiGet } from "@/lib/api";
import { CATEGORY_LABELS, SITE } from "@/lib/site";
import type { Product } from "@/lib/types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "أسعار المواد في تونس",
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const { data: products, failed } = await tryApiGet<Product[]>("/products", 300);
  const categories = Array.from(new Set((products ?? []).map((p) => p.category)));

  return (
    <div className="space-y-7">
      <section className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold leading-snug text-neutral-900">شوف الثمن قبل ما تخلص</h1>
          <p className="text-sm text-neutral-600">{SITE.shortDescription}</p>
        </div>
        <SearchBox />
      </section>

      {categories.length > 0 && (
        <section aria-label="الأصناف" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {categories.map((c) => (
            <Link
              key={c}
              href={`/search?category=${encodeURIComponent(c)}`}
              className="shrink-0 rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-sm hover:border-brand hover:text-brand"
            >
              {CATEGORY_LABELS[c] ?? c}
            </Link>
          ))}
        </section>
      )}

      <section aria-labelledby="popular" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="popular" className="text-lg font-semibold">المواد</h2>
          <Link href="/search" className="text-sm text-brand hover:underline">
            شوف الكل
          </Link>
        </div>
        {failed ? (
          <Unavailable />
        ) : (
          <div className="grid gap-2.5">
            {(products ?? []).slice(0, 12).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl bg-brand-soft p-5 text-sm text-emerald-950">
        <h2 className="mb-1 font-semibold">عندك ثمن جديد؟</h2>
        <p className="mb-3">زيدو باش يستفيد منو الكل. مجاني وبلا تسجيل.</p>
        <Link href="/submit" className="inline-flex h-10 items-center rounded-lg bg-brand px-4 font-semibold text-white hover:bg-emerald-800">
          زيد ثمن
        </Link>
      </section>
    </div>
  );
}
