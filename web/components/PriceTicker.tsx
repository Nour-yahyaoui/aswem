import { PriceDelta } from "@/components/PriceDelta";
import { formatTnd } from "@/lib/format";
import { t, type Locale } from "@/lib/i18n";
import { vsMarket } from "@/lib/trading";
import type { GovStat } from "@/lib/types";

/** Horizontal strip of governorates, cheapest first, each with its move against the market. */
export function PriceTicker({
  locale,
  stats,
  govName,
}: {
  locale: Locale;
  stats: GovStat[];
  govName: (id: number) => string;
}) {
  const dict = t(locale).ui.trading;
  const rows = stats
    .filter((s) => s.samples > 0)
    .sort((a, b) => a.median_millimes - b.median_millimes)
    .map((s) => ({ stat: s, delta: vsMarket(stats, s.governorate_id) }));

  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="ticker-title" className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="ticker-title" className="text-lg font-semibold">
          {dict.ticker}
        </h2>
      </div>
      <ul className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0" role="list">
        {rows.map(({ stat, delta }) => (
          <li
            key={stat.governorate_id}
            className="w-40 shrink-0 snap-start rounded-xl bg-white p-3 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800"
          >
            <p className="truncate text-xs text-neutral-500">{govName(stat.governorate_id)}</p>
            <p className="mt-1 text-base font-bold tabular-nums">{formatTnd(stat.median_millimes, locale)}</p>
            <div className="mt-2">{delta && <PriceDelta delta={delta} locale={locale} label={dict.vsMarket} />}</div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-neutral-500">{dict.tickerNote}</p>
    </section>
  );
}
