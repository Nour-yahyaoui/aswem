"use client";

import { LocateFixed, Plus, Route, Store, X, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PriceDelta } from "@/components/PriceDelta";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/Modal";
import { ADVISOR_RULES, type Plan, type TripOption } from "@/lib/advisor";
import { formatTnd } from "@/lib/format";
import { fill, governorateName, productName, t, type Locale } from "@/lib/i18n";
import { nearestGovernorate } from "@/lib/geo";
import { fetchWithRetry } from "@/lib/retry";
import { deltaOf } from "@/lib/trading";
import type { Governorate, Product } from "@/lib/types";

const STORAGE_KEY = "aswem-list";
const MAX_ITEMS = 20;

const fieldClass =
  "h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-900";

/** Shopping-list planner. The list is kept in this browser only, never on the server. */
export function ListPlanner({
  locale,
  products,
  governorates,
}: {
  locale: Locale;
  products: Product[];
  governorates: Governorate[];
}) {
  const dict = t(locale);
  const copy = dict.ui.list;
  const toast = useToast();
  const [items, setItems] = useState<string[]>([]);
  const [govId, setGovId] = useState<number>(governorates[0]?.id ?? 1);
  const [query, setQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [locating, setLocating] = useState(false);
  const [howOpen, setHowOpen] = useState(false);

  const byslug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const govById = useMemo(() => new Map(governorates.map((g) => [g.id, g])), [governorates]);
  const govName = (id: number) => {
    const g = govById.get(id);
    return g ? governorateName(g, locale) : "—";
  };

  // Restore the saved list after hydration, so the server and browser render the same first frame.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { items?: unknown; govId?: unknown };
        if (Array.isArray(saved.items)) {
          setItems(saved.items.filter((s): s is string => typeof s === "string" && byslug.has(s)).slice(0, MAX_ITEMS));
        }
        if (typeof saved.govId === "number" && govById.has(saved.govId)) setGovId(saved.govId);
      }
    } catch {
      // Corrupt or blocked storage: start with an empty list.
    }
    setHydrated(true);
  }, [byslug, govById]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, govId }));
    } catch {
      // Storage can be blocked; the planner still works for this visit.
    }
  }, [items, govId, hydrated]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => !items.includes(p.slug))
      .filter((p) => `${p.name_ar} ${p.name_latin}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, products, items]);

  function addItem(slug: string) {
    if (items.length >= MAX_ITEMS) {
      toast.show("info", fill(copy.limit, { max: MAX_ITEMS }));
      return;
    }
    setItems((prev) => [...prev, slug]);
    setPlan(null);
    setQuery("");
  }

  function removeItem(slug: string) {
    setItems((prev) => prev.filter((s) => s !== slug));
    setPlan(null);
  }

  function useMyPosition() {
    if (!navigator.geolocation) {
      toast.show("error", dict.submit.geoUnsupported);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = nearestGovernorate(pos.coords.latitude, pos.coords.longitude, governorates);
        if (nearest) {
          setGovId(nearest.id);
          setPlan(null);
          toast.show("success", fill(dict.submit.geoPicked, { gov: governorateName(nearest, locale) }));
        }
        setLocating(false);
      },
      () => {
        toast.show("error", dict.submit.geoDenied);
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  async function compare() {
    if (items.length === 0) return;
    setLoading(true);
    setFailed(false);
    setPlan(null);
    try {
      const res = await fetchWithRetry(
        "/api/list/compare",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, governorateId: govId }),
          cache: "no-store",
        },
        { attempts: 2, timeoutMs: 20_000 },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPlan((await res.json()) as Plan);
    } catch {
      setFailed(true);
      toast.show("error", copy.error);
    } finally {
      setLoading(false);
    }
  }

  const coverageText = plan ? fill(copy.coverage, { n: plan.itemsPricedHere, total: items.length }) : "";
  const rec = plan?.recommendation ?? null;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{copy.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{copy.intro}</p>
      </header>

      <section aria-labelledby="pick-title" className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
        <h2 id="pick-title" className="sr-only">
          {copy.title}
        </h2>

        <div className="space-y-2">
          <label htmlFor="list-search" className="block text-sm font-semibold">
            {copy.search}
          </label>
          <input
            id="list-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.search}
            autoComplete="off"
            className={fieldClass}
          />
          {query.trim() && suggestions.length === 0 && <p className="text-sm text-neutral-500">{copy.noMatch}</p>}
          {suggestions.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label={copy.search}>
              {suggestions.map((p) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => addItem(p.slug)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-brand/40 bg-brand-soft px-3 text-sm font-medium text-brand-text hover:bg-brand/10"
                  >
                    <Plus size={14} aria-hidden="true" />
                    {productName(p, locale)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">
            {copy.title} <span className="font-normal text-neutral-500">({items.length}/{MAX_ITEMS})</span>
          </h3>
          {items.length === 0 ? (
            <p className="text-sm text-neutral-500">{copy.empty}</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {items.map((slug) => {
                const p = byslug.get(slug);
                if (!p) return null;
                return (
                  <li key={slug}>
                    <span className="inline-flex h-9 items-center gap-1 rounded-full bg-neutral-100 ps-3 pe-1 text-sm dark:bg-neutral-800">
                      {productName(p, locale)}
                      <button
                        type="button"
                        onClick={() => removeItem(slug)}
                        aria-label={`${copy.remove} ${productName(p, locale)}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      >
                        <X size={14} aria-hidden="true" />
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-2">
            <label htmlFor="list-gov" className="block text-sm font-semibold">
              {copy.governorate}
            </label>
            <select
              id="list-gov"
              value={govId}
              onChange={(e) => {
                setGovId(Number(e.target.value));
                setPlan(null);
              }}
              className={fieldClass}
            >
              {governorates.map((g) => (
                <option key={g.id} value={g.id}>
                  {governorateName(g, locale)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={useMyPosition}
            disabled={locating}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-neutral-300 px-4 text-sm font-semibold hover:border-brand disabled:opacity-60 dark:border-neutral-700"
          >
            <LocateFixed size={18} aria-hidden="true" />
            {locating ? copy.locating : copy.useLocation}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={compare}
            disabled={items.length === 0 || loading}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-on-brand hover:bg-emerald-800 disabled:opacity-50 sm:flex-none"
          >
            <Route size={18} aria-hidden="true" />
            {loading ? copy.comparing : failed ? dict.ui.retry : copy.compare}
          </button>
        </div>
      </section>

      {plan && (
        <section aria-labelledby="result-title" aria-live="polite" className="space-y-5">
          <div
            className={`rounded-2xl p-5 shadow-sm ring-1 ${
              rec
                ? "bg-emerald-50 ring-emerald-200 dark:bg-emerald-950/40 dark:ring-emerald-800"
                : "bg-white ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800"
            }`}
          >
            <h2 id="result-title" className="text-lg font-bold">
              {rec ? fill(copy.buyThere, { gov: govName(rec.govId) }) : copy.buyHere}
            </h2>
            {!rec && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{copy.keepHere}</p>}
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-neutral-500">{copy.total}</dt>
                <dd className="font-bold tabular-nums">{formatTnd(plan.localTotalMillimes, locale)}</dd>
              </div>
              {rec && (
                <>
                  <div>
                    <dt className="text-neutral-500">{copy.trip}</dt>
                    <dd className="font-bold tabular-nums">
                      {formatTnd(rec.tripCostMillimes, locale)}{" "}
                      <span className="text-xs font-normal text-neutral-500">({fill(copy.distance, { km: rec.distanceKm })})</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">{copy.net}</dt>
                    <dd className="font-bold tabular-nums">{formatTnd(rec.netMillimes, locale)}</dd>
                  </div>
                </>
              )}
            </dl>
            {rec && (
              <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold">{copy.saving}</span>
                <PriceDelta delta={deltaOf(0, -rec.savingMillimes)} locale={locale} label={copy.saving} />
              </p>
            )}
            <p className="mt-3 text-xs text-neutral-500">{coverageText}</p>
            <button
              type="button"
              onClick={() => setHowOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-text underline-offset-4 hover:underline"
            >
              <Info size={15} aria-hidden="true" />
              {copy.howButton}
            </button>
          </div>

          {plan.options.length > 0 && (
            <section aria-labelledby="opts-title" className="space-y-2">
              <h3 id="opts-title" className="flex items-center gap-2 font-semibold">
                <Store size={18} aria-hidden="true" />
                {copy.options}
              </h3>
              <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl bg-white ring-1 ring-neutral-200 dark:divide-neutral-800 dark:bg-neutral-900 dark:ring-neutral-800">
                {plan.options.map((o: TripOption) => (
                  <li key={o.govId} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                    <span className="font-semibold">{govName(o.govId)}</span>
                    <span className="text-neutral-500">{fill(copy.distance, { km: o.distanceKm })}</span>
                    <PriceDelta delta={deltaOf(0, -o.savingMillimes)} locale={locale} label={copy.saving} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="items-title" className="space-y-2">
            <h3 id="items-title" className="font-semibold">
              {copy.title}
            </h3>
            <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl bg-white ring-1 ring-neutral-200 dark:divide-neutral-800 dark:bg-neutral-900 dark:ring-neutral-800">
              {plan.items.map((item) => {
                const p = byslug.get(item.slug);
                const here = item.hereMillimes;
                const cheapest = item.cheapestMillimes;
                const cheaperElsewhere =
                  here !== null && cheapest !== null && item.cheapestGovId !== null && item.cheapestGovId !== plan.govId;
                return (
                  <li key={item.slug} className="space-y-1 px-4 py-3 text-sm">
                    <p className="font-semibold">{p ? productName(p, locale) : item.slug}</p>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-neutral-600 dark:text-neutral-400">
                      <span>
                        {copy.priceHere}:{" "}
                        <span className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                          {here !== null ? formatTnd(here, locale) : copy.noData}
                        </span>
                      </span>
                      {cheapest !== null && item.cheapestGovId !== null && (
                        <span>
                          {copy.cheapest} ({govName(item.cheapestGovId)}):{" "}
                          <span className="font-semibold tabular-nums">{formatTnd(cheapest, locale)}</span>
                        </span>
                      )}
                      {cheaperElsewhere && <PriceDelta delta={deltaOf(here, cheapest)} locale={locale} />}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>

          <Modal open={howOpen} onClose={() => setHowOpen(false)} title={copy.howTitle} closeLabel={dict.ui.close}>
            <p className="text-neutral-700 dark:text-neutral-300">
              {fill(copy.how, {
                cost: ADVISOR_RULES.tripCostPerKmMillimes,
                min: ADVISOR_RULES.minSavingMillimes,
                max: ADVISOR_RULES.maxTripKm,
              })}
            </p>
          </Modal>
        </section>
      )}
    </div>
  );
}
