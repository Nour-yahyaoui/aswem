import { fetchWithRetry } from "@/lib/retry";

export const dynamic = "force-dynamic";

/** Checks the API health endpoint once, without retries, so flakiness shows up honestly. */
export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  const base = process.env.API_URL;
  if (!base) return Response.json({ ok: false, reason: "not_configured" }, { status: 503, headers });

  const started = performance.now();
  try {
    const res = await fetchWithRetry(
      `${base.replace(/\/$/, "")}/healthz`,
      { cache: "no-store", headers: { Accept: "application/json" } },
      { attempts: 1, timeoutMs: 15_000 },
    );
    const ms = Math.round(performance.now() - started);
    const ok = res.ok;
    return Response.json(
      { ok, status: res.status, ms, checkedAt: new Date().toISOString() },
      { status: ok ? 200 : 503, headers },
    );
  } catch {
    const ms = Math.round(performance.now() - started);
    return Response.json({ ok: false, reason: "unreachable", ms }, { status: 503, headers });
  }
}
