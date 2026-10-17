import { describe, expect, it } from "vitest";
import { ADVISOR_RULES, buildPlan, parseCompareRequest } from "@/lib/advisor";
import type { GovStat, Governorate } from "@/lib/types";

const govs: Governorate[] = [
  { id: 1, slug: "tunis", name_ar: "تونس", name_latin: "Tunis", lat: 36.8065, lng: 10.1815 },
  { id: 2, slug: "ariana", name_ar: "أريانة", name_latin: "Ariana", lat: 36.8625, lng: 10.1956 },
  { id: 3, slug: "sfax", name_ar: "صفاقس", name_latin: "Sfax", lat: 34.7406, lng: 10.7603 },
  { id: 4, slug: "gabes", name_ar: "قابس", name_latin: "Gabès", lat: 33.8815, lng: 10.0982 },
];

const stat = (governorate_id: number, median_millimes: number): GovStat => ({
  governorate_id,
  samples: 2,
  min_millimes: median_millimes,
  median_millimes,
  max_millimes: median_millimes,
  last_seen: "2026-10-16T10:00:00Z",
});

describe("buildPlan", () => {
  it("recommends a nearby town when the basket saves more than the trip costs", () => {
    const list = [
      { slug: "milk", stats: [stat(1, 3500), stat(2, 2000)] },
      { slug: "oil", stats: [stat(1, 9000), stat(2, 7000)] },
      { slug: "rice", stats: [stat(1, 4000), stat(2, 3000)] },
    ];
    const plan = buildPlan(list, 1, govs);
    expect(plan.localTotalMillimes).toBe(16500);
    expect(plan.itemsPricedHere).toBe(3);
    const best = plan.recommendation;
    expect(best?.govId).toBe(2);
    expect(best?.distanceKm).toBeLessThan(10);
    expect(best?.savingMillimes).toBeGreaterThanOrEqual(ADVISOR_RULES.minSavingMillimes);
    expect(best?.basketMillimes).toBe(12000); // 2000 + 7000 + 3000 at Ariana
  });

  it("says buy here when the saving is too small", () => {
    const list = [{ slug: "milk", stats: [stat(1, 3500), stat(2, 3400)] }];
    const plan = buildPlan(list, 1, govs);
    expect(plan.recommendation).toBeNull();
    expect(plan.options[0].savingMillimes).toBeLessThan(0);
  });

  it("never suggests a trip beyond the maximum distance", () => {
    // Gabès is about 330 km from Tunis, beyond the 300 km limit.
    const list = [{ slug: "milk", stats: [stat(1, 5000), stat(4, 1000)] }];
    const plan = buildPlan(list, 1, govs);
    expect(plan.options.find((o) => o.govId === 4)).toBeUndefined();
    expect(plan.recommendation).toBeNull();
  });

  it("returns cheapest place per item even when there is no local price", () => {
    const list = [{ slug: "milk", stats: [stat(2, 2000), stat(3, 1800)] }];
    const plan = buildPlan(list, 1, govs);
    expect(plan.items[0].hereMillimes).toBeNull();
    expect(plan.items[0].cheapestGovId).toBe(3);
    expect(plan.localTotalMillimes).toBe(0);
    expect(plan.recommendation).toBeNull();
  });
});

describe("parseCompareRequest", () => {
  it("accepts a valid request and removes duplicates", () => {
    expect(parseCompareRequest({ items: ["milk-1l", "milk-1l"], governorateId: 1 })).toEqual({
      items: ["milk-1l"],
      governorateId: 1,
    });
  });

  it("rejects bad input", () => {
    expect(parseCompareRequest(null)).toBeNull();
    expect(parseCompareRequest({ items: [], governorateId: 1 })).toBeNull();
    expect(parseCompareRequest({ items: ["../etc"], governorateId: 1 })).toBeNull();
    expect(parseCompareRequest({ items: ["milk"], governorateId: 1.5 })).toBeNull();
    expect(parseCompareRequest({ items: ["milk"], governorateId: 0 })).toBeNull();
    expect(parseCompareRequest({ items: Array(21).fill("milk"), governorateId: 1 })).toBeNull();
  });
});
