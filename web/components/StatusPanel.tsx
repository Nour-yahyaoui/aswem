"use client";

import { CircleAlert, CircleCheck, Gauge, RefreshCw, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import { fetchWithRetry } from "@/lib/retry";
import { t, type Locale } from "@/lib/i18n";
import { median } from "@/lib/trading";

type ApiCheck = { ok: boolean; ms: number; status?: number; checkedAt: string };
const PING_SAMPLES = 10;
const SLOW_API_MS = 1500;

/** Live status of the API, plus a browser-side speed test against the web server. */
export function StatusPanel({ locale }: { locale: Locale }) {
  const dict = t(locale).ui.status;
  const toast = useToast();
  const [api, setApi] = useState<ApiCheck | null>(null);
  const [pings, setPings] = useState<number[]>([]);
  const [running, setRunning] = useState(false);

  const run = useCallback(
    async (notify: boolean) => {
      setRunning(true);
      try {
        const apiRes = await fetchWithRetry("/api/status/api", { cache: "no-store" }, { attempts: 1, timeoutMs: 15_000 });
        const body = (await apiRes.json().catch(() => null)) as { ok?: boolean; ms?: number; status?: number } | null;
        setApi({
          ok: apiRes.ok && body?.ok === true,
          ms: typeof body?.ms === "number" ? body.ms : 0,
          status: body?.status,
          checkedAt: new Date().toISOString(),
        });

        const measured: number[] = [];
        for (let i = 0; i < PING_SAMPLES; i++) {
          const started = performance.now();
          const res = await fetchWithRetry("/api/status/ping", { cache: "no-store" }, { attempts: 1, timeoutMs: 8_000 });
          if (!res.ok) throw new Error(`ping ${res.status}`);
          measured.push(Math.round(performance.now() - started));
        }
        setPings(measured);
        if (notify) toast.show("success", dict.testDone);
      } catch {
        if (notify) toast.show("error", dict.testFailed);
      } finally {
        setRunning(false);
      }
    },
    [dict, toast],
  );

  useEffect(() => {
    void run(false);
  }, [run]);

  const apiState = !api ? null : !api.ok ? "down" : api.ms > SLOW_API_MS ? "degraded" : "operational";
  const stateStyle = {
    operational: { label: dict.operational, Icon: CircleCheck, tone: "text-emerald-700 dark:text-emerald-300" },
    degraded: { label: dict.degraded, Icon: TriangleAlert, tone: "text-amber-700 dark:text-amber-300" },
    down: { label: dict.down, Icon: CircleAlert, tone: "text-red-700 dark:text-red-300" },
  } as const;

  const min = pings.length ? Math.min(...pings) : null;
  const max = pings.length ? Math.max(...pings) : null;
  const mid = median(pings);
  const barMax = Math.max(1, ...pings);

  return (
    <div className="space-y-6">
      <section aria-labelledby="svc-title" className="grid gap-3 sm:grid-cols-2">
        <h2 id="svc-title" className="sr-only">
          {dict.title}
        </h2>

        <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
          <p className="text-sm text-neutral-500">{dict.web}</p>
          <p className="mt-1 flex items-center gap-2 text-lg font-bold text-emerald-700 dark:text-emerald-300">
            <CircleCheck size={20} aria-hidden="true" />
            {dict.operational}
          </p>
        </article>

        <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800" aria-live="polite">
          <p className="text-sm text-neutral-500">{dict.api}</p>
          {apiState ? (
            <>
              <p className={`mt-1 flex items-center gap-2 text-lg font-bold ${stateStyle[apiState].tone}`}>
                {(() => {
                  const Icon = stateStyle[apiState].Icon;
                  return <Icon size={20} aria-hidden="true" />;
                })()}
                {stateStyle[apiState].label}
              </p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {dict.latency}: <span className="font-semibold tabular-nums" dir="ltr">{api?.ms} ms</span>
                {" · "}
                {dict.checkedAt}: <span dir="ltr">{new Date(api!.checkedAt).toLocaleTimeString(locale === "ar" ? "ar-TN" : "fr-TN")}</span>
              </p>
              {!api?.ok && <p className="mt-2 text-sm text-red-700 dark:text-red-300">{dict.apiDown}</p>}
            </>
          ) : (
            <p className="mt-1 text-lg text-neutral-400">{dict.running}</p>
          )}
        </article>
      </section>

      <section aria-labelledby="speed-title" className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="speed-title" className="flex items-center gap-2 text-lg font-semibold">
            <Gauge size={20} aria-hidden="true" />
            {dict.speedTest}
          </h2>
          <button
            type="button"
            onClick={() => run(true)}
            disabled={running}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-on-brand hover:bg-emerald-800 disabled:opacity-60"
          >
            <RefreshCw size={16} className={running ? "animate-spin" : undefined} aria-hidden="true" />
            {running ? dict.running : dict.runAgain}
          </button>
        </div>

        {pings.length > 0 && (
          <>
            <dl className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              {[
                [dict.median, mid],
                [dict.min, min],
                [dict.max, max],
                [dict.samples, pings.length],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/60">
                  <dt className="text-xs text-neutral-500">{label}</dt>
                  <dd className="mt-1 text-lg font-bold tabular-nums" dir="ltr">
                    {typeof value === "number" && label !== dict.samples ? `${Math.round(value)} ms` : value}
                  </dd>
                </div>
              ))}
            </dl>
            <div role="img" aria-label={`${dict.speedTest}: ${Math.round(mid ?? 0)} ms`} className="flex h-24 items-end gap-1.5">
              {pings.map((ms, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-t bg-brand/80"
                  style={{ height: `${Math.max(6, (ms / barMax) * 100)}%` }}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
