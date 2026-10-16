import Link from "next/link";
import { categoryLabel, productName, type Locale } from "@/lib/i18n";
import type { Product } from "@/lib/types";

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const name = productName(product, locale);
  const secondary = locale === "ar" ? product.name_latin : product.name_ar;
  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3.5 transition hover:border-brand/40 hover:shadow-sm"
    >
      <div className="min-w-0">
        <p className="truncate font-semibold text-neutral-900">{name}</p>
        <p className="truncate text-xs text-neutral-500" dir={locale === "ar" ? "ltr" : "rtl"}>
          {secondary}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">
        {categoryLabel(product.category, locale)}
      </span>
    </Link>
  );
}
