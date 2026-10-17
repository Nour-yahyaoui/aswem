import { describe, expect, it } from "vitest";
import { nearestGovernorate } from "@/lib/geo";
import type { Governorate } from "@/lib/types";

const govs: Governorate[] = [
  { id: 1, slug: "tunis", name_ar: "تونس", name_latin: "Tunis", lat: 36.8, lng: 10.18 },
  { id: 13, slug: "monastir", name_ar: "المنستير", name_latin: "Monastir", lat: 35.78, lng: 10.83 },
  { id: 15, slug: "sfax", name_ar: "صفاقس", name_latin: "Sfax", lat: 34.74, lng: 10.76 },
];

describe("nearestGovernorate", () => {
  it("finds the governorate closest to a point", () => {
    expect(nearestGovernorate(35.77, 10.82, govs)?.slug).toBe("monastir");
    expect(nearestGovernorate(36.79, 10.17, govs)?.slug).toBe("tunis");
  });

  it("returns undefined for an empty list", () => {
    expect(nearestGovernorate(35, 10, [])).toBeUndefined();
  });
});
