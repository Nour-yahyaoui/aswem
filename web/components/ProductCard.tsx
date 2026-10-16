import Link from "next/link";
import { CATEGORY_LABELS } from "@/lib/site";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3.5 transition hover:border-brand/40 hover:shadow-sm"
    >
      <div className="min-w-0">
        <p className="truncate font-semibold text-neutral-900">{product.name_ar}</p>
        <p className="truncate text-xs text-neutral-500" dir="ltr">
          {product.name_latin}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">
        {CATEGORY_LABELS[product.category] ?? product.category}
      </span>
    </Link>
  );
}
