import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { clientIpFrom } = await import("@/lib/client-ip");

describe("clientIpFrom", () => {
  it("uses the last X-Forwarded-For entry, never the client-supplied first one", () => {
    expect(clientIpFrom("1.2.3.4, 41.230.10.20")).toBe("41.230.10.20");
  });

  it("falls back to unknown when the header is missing or empty", () => {
    expect(clientIpFrom(null)).toBe("unknown");
    expect(clientIpFrom("  ,  ")).toBe("unknown");
  });

  it("caps the length", () => {
    expect(clientIpFrom("a".repeat(200)).length).toBe(64);
  });
});
