import { describe, expect, it } from "vitest";
import { dictionaries, fill, LOCALES, productName, isLocale } from "@/lib/i18n";

function keysOf(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) => keysOf(v, prefix ? `${prefix}.${k}` : k));
}

describe("translations", () => {
  it("have exactly the same keys in every language", () => {
    const ar = keysOf(dictionaries.ar).sort();
    const fr = keysOf(dictionaries.fr).sort();
    expect(fr).toEqual(ar);
  });

  it("have no empty strings", () => {
    for (const locale of LOCALES) {
      for (const key of keysOf(dictionaries[locale])) {
        const value = key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], dictionaries[locale]);
        if (typeof value === "string") expect(value.trim(), `${locale}.${key}`).not.toBe("");
      }
    }
  });
});

describe("helpers", () => {
  it("fills placeholders", () => {
    expect(fill("سعر {name} في {gov}", { name: "حليب", gov: "تونس" })).toBe("سعر حليب في تونس");
  });

  it("leaves unknown placeholders empty instead of printing them", () => {
    expect(fill("Hello {who}", {})).toBe("Hello ");
  });

  it("picks the product name for the language", () => {
    const p = { name_ar: "حليب", name_latin: "Lait" };
    expect(productName(p, "ar")).toBe("حليب");
    expect(productName(p, "fr")).toBe("Lait");
  });

  it("validates locales", () => {
    expect(isLocale("ar")).toBe(true);
    expect(isLocale("en")).toBe(false);
  });
});
