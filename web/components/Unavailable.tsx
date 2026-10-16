import { t, type Locale } from "@/lib/i18n";

export function Unavailable({ locale }: { locale: Locale }) {
  const dict = t(locale);
  return (
    <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
      <p className="font-semibold">{dict.unavailable.title}</p>
      <p className="mt-1 text-sm">{dict.unavailable.text}</p>
    </div>
  );
}
