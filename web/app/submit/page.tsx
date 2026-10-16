import type { Metadata } from "next";
import { SubmitForm } from "@/components/SubmitForm";
import { Unavailable } from "@/components/Unavailable";
import { tryApiGet } from "@/lib/api";
import type { Governorate, Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "زيد ثمن",
  description: "زيد ثمن المادة اللي شفتها في الولاية متاعك، بالمجان وبلا تسجيل.",
  alternates: { canonical: "/submit" },
};

export const revalidate = 3600;

type Props = { searchParams: Promise<{ product?: string }> };

export default async function SubmitPage({ searchParams }: Props) {
  const { product } = await searchParams;
  const [productsRes, govsRes] = await Promise.all([
    tryApiGet<Product[]>("/products", 300),
    tryApiGet<Governorate[]>("/governorates", 86400),
  ]);

  const products = [...(productsRes.data ?? [])].sort((a, b) => a.name_ar.localeCompare(b.name_ar, "ar"));
  const governorates = [...(govsRes.data ?? [])].sort((a, b) => a.name_latin.localeCompare(b.name_latin));
  const defaultProductId = products.find((p) => p.slug === product)?.id;

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">زيد ثمن</h1>
        <p className="text-sm text-neutral-600">شارك الثمن اللي شفتو، وخلي الجماعة تستفيد.</p>
      </header>

      {productsRes.failed || govsRes.failed ? (
        <Unavailable />
      ) : (
        <SubmitForm products={products} governorates={governorates} defaultProductId={defaultProductId} />
      )}
    </div>
  );
}
