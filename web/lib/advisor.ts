import { distanceKm } from "@/lib/geo";
import type { GovStat, Governorate } from "@/lib/types";

/**
 * Shopping-trip rules. These are assumptions, not measured data.
 * Change them here and every recommendation follows.
 */
export const ADVISOR_RULES = {
  /** Cost of travel per kilometre, one way counted twice (round trip), in millimes. 150 = 0.150 TND/km. */
  tripCostPerKmMillimes: 150,
  /** Never suggest a trip longer than this one way, in kilometres. */
  maxTripKm: 300,
  /** Only recommend travelling when the basket saves at least this much after trip cost. */
  minSavingMillimes: 1000,
  /** How many alternatives to return. */
  maxOptions: 5,
} as const;

export const MAX_LIST_ITEMS = 20;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,80}$/;

export type ListItem = { slug: string; stats: GovStat[] };

export type ItemAdvice = {
  slug: string;
  hereMillimes: number | null;
  cheapestGovId: number | null;
  cheapestMillimes: number | null;
};

export type TripOption = {
  govId: number;
  distanceKm: number;
  tripCostMillimes: number;
  basketMillimes: number;
  netMillimes: number;
  savingMillimes: number;
  pricedItems: number;
};

export type Plan = {
  govId: number;
  localTotalMillimes: number;
  itemsPricedHere: number;
  items: ItemAdvice[];
  recommendation: TripOption | null;
  options: TripOption[];
};

function medianOf(stat: GovStat | undefined): number | null {
  return stat && stat.samples > 0 ? stat.median_millimes : null;
}

export function buildPlan(list: ListItem[], localGovId: number, govs: Governorate[]): Plan {
  const local = govs.find((g) => g.id === localGovId);
  const statFor = (item: ListItem, govId: number) =>
    item.stats.find((s) => s.governorate_id === govId && s.samples > 0);

  const items: ItemAdvice[] = list.map((item) => {
    const cheapest = item.stats
      .filter((s) => s.samples > 0)
      .reduce<GovStat | undefined>((best, s) => (!best || s.median_millimes < best.median_millimes ? s : best), undefined);
    return {
      slug: item.slug,
      hereMillimes: medianOf(statFor(item, localGovId)),
      cheapestGovId: cheapest?.governorate_id ?? null,
      cheapestMillimes: cheapest?.median_millimes ?? null,
    };
  });

  // Only items with a local price are compared, so the comparison is like for like.
  const pricedHere = list.filter((item) => medianOf(statFor(item, localGovId)) !== null);
  const localTotal = pricedHere.reduce((sum, item) => sum + (medianOf(statFor(item, localGovId)) ?? 0), 0);

  const candidateIds = new Set<number>();
  for (const item of pricedHere) {
    for (const s of item.stats) {
      if (s.samples > 0 && s.governorate_id !== localGovId) candidateIds.add(s.governorate_id);
    }
  }

  const options: TripOption[] = [];
  if (local) {
    for (const govId of candidateIds) {
      const gov = govs.find((g) => g.id === govId);
      if (!gov) continue;
      const km = distanceKm(local.lat, local.lng, gov.lat, gov.lng);
      if (km > ADVISOR_RULES.maxTripKm) continue;

      let basket = 0;
      let priced = 0;
      for (const item of pricedHere) {
        const here = medianOf(statFor(item, localGovId)) ?? 0;
        const there = medianOf(statFor(item, govId));
        if (there !== null) priced++;
        basket += there ?? here; // not priced there: assume the local price, so it changes nothing
      }
      if (priced === 0) continue;

      const tripCost = Math.round(km * 2 * ADVISOR_RULES.tripCostPerKmMillimes);
      const net = basket + tripCost;
      options.push({
        govId,
        distanceKm: Math.round(km),
        tripCostMillimes: tripCost,
        basketMillimes: basket,
        netMillimes: net,
        savingMillimes: localTotal - net,
        pricedItems: priced,
      });
    }
  }

  options.sort((a, b) => b.savingMillimes - a.savingMillimes);
  const top = options.slice(0, ADVISOR_RULES.maxOptions);
  const best = top[0];
  return {
    govId: localGovId,
    localTotalMillimes: localTotal,
    itemsPricedHere: pricedHere.length,
    items,
    recommendation: best && best.savingMillimes >= ADVISOR_RULES.minSavingMillimes ? best : null,
    options: top,
  };
}

export type CompareRequest = { items: string[]; governorateId: number };

/** Validates the body of POST /api/list/compare. Returns null when anything is wrong. */
export function parseCompareRequest(body: unknown): CompareRequest | null {
  if (!body || typeof body !== "object") return null;
  const { items, governorateId } = body as Record<string, unknown>;
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LIST_ITEMS) return null;
  if (!items.every((i) => typeof i === "string" && SLUG_PATTERN.test(i))) return null;
  if (typeof governorateId !== "number" || !Number.isInteger(governorateId) || governorateId < 1) return null;
  return { items: [...new Set(items as string[])], governorateId };
}
