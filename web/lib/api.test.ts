import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { tryApiGet } = await import("@/lib/api");

describe("tryApiGet", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("reports failure instead of throwing when the API is unreachable", async () => {
    vi.stubEnv("API_URL", "https://api.example.test");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(tryApiGet("/products")).resolves.toEqual({ data: null, failed: true });
  });

  it("reports failure when the body is not JSON (for example an HTML error page)", async () => {
    vi.stubEnv("API_URL", "https://api.example.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>wake up</html>", { status: 200 })));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(tryApiGet("/products")).resolves.toEqual({ data: null, failed: true });
  });

  it("treats 404 as a missing record, not a failure", async () => {
    vi.stubEnv("API_URL", "https://api.example.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 404 })));
    await expect(tryApiGet("/products/nope")).resolves.toEqual({ data: null, failed: false });
  });

  it("returns data on success", async () => {
    vi.stubEnv("API_URL", "https://api.example.test/");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify([{ id: 1 }]), { status: 200 })));
    await expect(tryApiGet<{ id: number }[]>("/products")).resolves.toEqual({ data: [{ id: 1 }], failed: false });
  });
});

describe("retries", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("retries a cold-start failure and then succeeds", async () => {
    vi.stubEnv("API_URL", "https://api.example.test");
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 2 }]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(tryApiGet<{ id: number }[]>("/products")).resolves.toEqual({ data: [{ id: 2 }], failed: false });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
