import { describe, expect, it } from "vitest";
import { deltaOf, formatSigned, marketMedian, median, previousFor, vsMarket, vsPrevious } from "@/lib/trading";
import type { GovStat, PriceReport } from "@/lib/types";

const stat = (governorate_id: number, median_millimes: number, samples = 3): GovStat => ({
  governorate_id,
  samples,
  min_millimes: median_millimes - 100,
  median_millimes,
  max_millimes: median_millimes + 100,
  last_seen: "2026-10-16T10:00:00Z",
});

describe("median", () => {
  it("handles odd, even and empty lists", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBeNull();
  });
});

describe("deltaOf", () => {
  it("reports a rise, a fall and no change", () => {
    expect(deltaOf(3500, 3600)).toEqual({ millimes: 100, direction: "up" });
    expect(deltaOf(3500, 3250)).toEqual({ millimes: -250, direction: "down" });
    expect(deltaOf(3500, 3500)).toEqual({ millimes: 0, direction: "flat" });
  });
});

describe("formatSigned", () => {
  it("shows an explicit plus or minus sign", () => {
    expect(formatSigned(100)).toBe("+100");
    expect(formatSigned(-250)).toBe("-250");
    expect(formatSigned(0)).toBe("0");
  });
});

describe("vsMarket", () => {
  it("compares a governorate with the median of the others, not including itself", () => {
    const stats = [stat(1, 3500), stat(2, 3300), stat(3, 3400), stat(4, 3000)];
    // others for gov 1: 3300, 3400, 3000 -> median 3300
    expect(marketMedian(stats, 1)).toBe(3300);
    expect(vsMarket(stats, 1)).toEqual({ millimes: 200, direction: "up" });
    expect(vsMarket(stats, 4)).toEqual({ millimes: -400, direction: "down" });
  });

  it("returns null when there is nothing to compare with", () => {
    expect(vsMarket([stat(1, 3500)], 1)).toBeNull();
    expect(vsMarket([stat(1, 3500, 0)], 1)).toBeNull();
  });
});

describe("vsPrevious", () => {
  const report = (id: number, governorate_id: number, price: number, created_at: string): PriceReport => ({
    id,
    governorate_id,
    price_millimes: price,
    address: null,
    created_at,
  });

  it("compares the newest report with the one before, regardless of input order", () => {
    const recent = [
      report(2, 1, 3600, "2026-10-16T09:00:00Z"),
      report(1, 1, 3500, "2026-10-10T09:00:00Z"),
      report(3, 2, 2000, "2026-10-16T09:00:00Z"),
    ];
    const change = vsPrevious(recent, 1);
    expect(change?.delta).toEqual({ millimes: 100, direction: "up" });
    expect(change?.current).toBe(3600);
    expect(vsPrevious(recent, 2)).toBeNull();
  });
});

describe("previousFor", () => {
  it("finds the earlier report in the same governorate for each row", () => {
    const r = (id: number, gov: number, price: number, at: string): PriceReport => ({
      id,
      governorate_id: gov,
      price_millimes: price,
      address: null,
      created_at: at,
    });
    const recent = [
      r(3, 1, 3700, "2026-10-16T09:00:00Z"),
      r(2, 1, 3600, "2026-10-12T09:00:00Z"),
      r(1, 1, 3500, "2026-10-01T09:00:00Z"),
      r(4, 2, 1000, "2026-10-15T09:00:00Z"),
    ];
    expect(previousFor(recent, recent[0])).toEqual({ millimes: 100, direction: "up" });
    expect(previousFor(recent, recent[2])).toBeNull();
    expect(previousFor(recent, recent[3])).toBeNull();
  });
});
