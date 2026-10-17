import { describe, expect, it } from "vitest";
import { formatDate, formatTnd } from "@/lib/format";

describe("formatTnd", () => {
  it("formats millimes in Arabic with the dinar symbol", () => {
    expect(formatTnd(3500, "ar")).toBe("3.500 د.ت");
  });

  it("formats millimes in French with a decimal comma", () => {
    expect(formatTnd(3500, "fr")).toBe("3,500 DT");
  });

  it("keeps three decimals for small amounts", () => {
    expect(formatTnd(100, "fr")).toBe("0,100 DT");
  });
});

describe("formatDate", () => {
  it("returns a non-empty localized string", () => {
    const text = formatDate("2026-10-17T10:00:00Z", "fr");
    expect(text.length).toBeGreaterThan(0);
  });
});
