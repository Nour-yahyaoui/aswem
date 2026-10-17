import type { GovStat, PriceReport } from "@/lib/types";

/**
 * Price-movement maths. All values are in millimes (1 TND = 1000 millimes).
 * Sign convention: positive = the price went up, negative = it went down.
 */
export type Direction = "up" | "down" | "flat";
export type Delta = { millimes: number; direction: Direction };

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function deltaOf(from: number, to: number): Delta {
  const millimes = Math.round(to - from);
  return { millimes, direction: millimes > 0 ? "up" : millimes < 0 ? "down" : "flat" };
}

/** Signed number for display, for example "+100" or "-250". */
export function formatSigned(millimes: number): string {
  return new Intl.NumberFormat("en-US", { signDisplay: "exceptZero", maximumFractionDigits: 0 }).format(millimes);
}

/** Median of the other governorates' medians. Null when there is nothing to compare with. */
export function marketMedian(stats: GovStat[], excludeGovId?: number): number | null {
  return median(
    stats.filter((s) => s.samples > 0 && s.governorate_id !== excludeGovId).map((s) => s.median_millimes),
  );
}

/** How a governorate's median compares with the rest of the country. */
export function vsMarket(stats: GovStat[], govId: number): Delta | null {
  const own = stats.find((s) => s.governorate_id === govId && s.samples > 0);
  const market = marketMedian(stats, govId);
  if (!own || market === null) return null;
  return deltaOf(market, own.median_millimes);
}

export type PreviousChange = {
  current: number;
  previous: number;
  delta: Delta;
  at: string;
};

/** The latest report in a governorate compared with the report before it. */
export function vsPrevious(recent: PriceReport[], govId: number): PreviousChange | null {
  const rows = recent
    .filter((r) => r.governorate_id === govId)
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  if (rows.length < 2) return null;
  return {
    current: rows[0].price_millimes,
    previous: rows[1].price_millimes,
    delta: deltaOf(rows[1].price_millimes, rows[0].price_millimes),
    at: rows[0].created_at,
  };
}

/** The report in the same governorate that came right before this one, with the change between them. */
export function previousFor(recent: PriceReport[], report: PriceReport): Delta | null {
  const at = Date.parse(report.created_at);
  let prev: PriceReport | null = null;
  for (const r of recent) {
    if (r.id === report.id || r.governorate_id !== report.governorate_id) continue;
    const when = Date.parse(r.created_at);
    if (when < at && (!prev || when > Date.parse(prev.created_at))) prev = r;
  }
  return prev ? deltaOf(prev.price_millimes, report.price_millimes) : null;
}
