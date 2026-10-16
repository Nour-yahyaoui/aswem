import Link from "next/link";
import { t } from "@/lib/i18n";

export default function NotFound() {
  const ar = t("ar").notFound;
  const fr = t("fr").notFound;
  return (
    <div className="py-16 text-center">
      <p className="text-5xl font-bold text-brand">404</p>
      <h1 className="mt-3 text-xl font-semibold">
        {ar.title}
        <span className="block text-sm font-normal text-neutral-500">{fr.title}</span>
      </h1>
      <div className="mt-6 flex justify-center gap-2">
        <Link href="/ar" className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white">
          {ar.home}
        </Link>
        <Link href="/fr" className="inline-flex h-10 items-center rounded-lg border border-neutral-300 px-4 text-sm font-semibold">
          {fr.home}
        </Link>
      </div>
    </div>
  );
}
