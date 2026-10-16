import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white pb-24">
      <div className="mx-auto max-w-3xl space-y-2 px-4 py-6 text-sm text-neutral-600">
        <p>
          {SITE.name} مجاني 100%، ومفتوح المصدر. الأسعار تزيدها الجماعة، وهي تقريبية.
        </p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            صنع بواسطة <strong className="text-neutral-900">{SITE.author}</strong>
          </span>
          <a href={SITE.github} target="_blank" rel="noopener noreferrer" className="text-brand underline-offset-4 hover:underline" dir="ltr">
            GitHub: Nour-yahyaoui
          </a>
          <a href={`tel:${SITE.phoneTel}`} className="text-brand underline-offset-4 hover:underline" dir="ltr">
            {SITE.phoneDisplay}
          </a>
        </p>
        <p className="text-xs text-neutral-500">
          <Link href="/about" className="underline-offset-4 hover:underline">
            عن الموقع
          </Link>
          {" · "}
          <a href={SITE.repo} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
            الكود المصدري
          </a>
        </p>
      </div>
    </footer>
  );
}
