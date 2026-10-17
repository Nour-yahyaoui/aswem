"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitReport, type ReportState } from "@/app/[lang]/report/actions";
import { useToast } from "@/components/Toast";
import { governorateName, productName, t, type Locale } from "@/lib/i18n";
import type { Governorate, Product } from "@/lib/types";

const initial: ReportState = { status: "idle" };

const fieldClass =
  "h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

const REASON_ORDER = ["expired", "spoiled", "wrong_label", "other"] as const;

export function ReportForm({
  locale,
  products,
  governorates,
  defaultProductId,
}: {
  locale: Locale;
  products: Product[];
  governorates: Governorate[];
  defaultProductId?: number;
}) {
  const dict = t(locale).report;
  const [state, action, pending] = useActionState(submitReport, initial);
  const [productId, setProductId] = useState(defaultProductId ? String(defaultProductId) : "");
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (state.status === "ok") toast.show("success", dict.successTitle);
    if (state.status === "error") toast.show("error", state.message);
  }, [state, toast, dict.successTitle]);

  useEffect(() => {
    if (state.status === "ok") {
      formRef.current?.reset();
      setProductId(defaultProductId ? String(defaultProductId) : "");
    }
  }, [state, defaultProductId]);

  return (
    <form ref={formRef} action={action} className="space-y-5">
      <input type="hidden" name="lang" value={locale} />

      {state.status === "ok" && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <p className="font-semibold">{dict.successTitle}</p>
          <Link href={`/${locale}`} className="mt-1 inline-block text-sm underline underline-offset-4">
            {t(locale).nav.home}
          </Link>
        </div>
      )}
      {state.status === "error" && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="product_id" className="block text-sm font-semibold">
          {dict.product}
        </label>
        <select
          id="product_id"
          name="product_id"
          required
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className={fieldClass}
        >
          <option value="" disabled>
            {dict.chooseProduct}
          </option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {productName(p, locale)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="governorate_id" className="block text-sm font-semibold">
          {dict.governorate}
        </label>
        <select id="governorate_id" name="governorate_id" required defaultValue="" className={fieldClass}>
          <option value="" disabled>
            {dict.chooseGovernorate}
          </option>
          {governorates.map((g) => (
            <option key={g.id} value={g.id}>
              {governorateName(g, locale)}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="space-y-2">
        <legend className="block text-sm font-semibold">{dict.reason}</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {REASON_ORDER.map((r) => (
            <label
              key={r}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-neutral-300 bg-white px-4 has-[:checked]:border-brand has-[:checked]:ring-2 has-[:checked]:ring-brand/20"
            >
              <input type="radio" name="reason" value={r} required className="h-4 w-4 accent-brand" />
              <span className="text-sm">{dict.reasons[r]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="note" className="block text-sm font-semibold">
          {dict.note}
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={300}
          placeholder={dict.notePlaceholder}
          className="w-full rounded-xl border border-neutral-300 bg-white p-4 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        <p className="text-xs text-neutral-500">{dict.noteHint}</p>
      </div>

      {/* Honeypot: hidden from people, often filled by bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{dict.disclaimer}</p>

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-brand text-base font-semibold text-on-brand shadow-sm hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? dict.submitting : dict.submit}
      </button>
    </form>
  );
}
