"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitPrice, type SubmitState } from "@/app/[lang]/submit/actions";
import { fill, governorateName, productName, t, type Locale } from "@/lib/i18n";
import { nearestGovernorate } from "@/lib/geo";
import type { Governorate, Product } from "@/lib/types";

const initial: SubmitState = { status: "idle" };

const fieldClass =
  "h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export function SubmitForm({
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
  const dict = t(locale).submit;
  const [state, action, pending] = useActionState(submitPrice, initial);
  const [productId, setProductId] = useState(defaultProductId ? String(defaultProductId) : "");
  const [governorateId, setGovernorateId] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "ok") {
      formRef.current?.reset();
      setProductId(defaultProductId ? String(defaultProductId) : "");
      setGovernorateId("");
      setLat("");
      setLng("");
    }
  }, [state, defaultProductId]);

  function useMyPosition() {
    if (!navigator.geolocation) {
      setGeoMessage(dict.geoUnsupported);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const nearest = nearestGovernorate(latitude, longitude, governorates);
        // Keep three decimals (about 110 m), the same precision the API stores.
        setLat(latitude.toFixed(3));
        setLng(longitude.toFixed(3));
        if (nearest) {
          setGovernorateId(String(nearest.id));
          setGeoMessage(fill(dict.geoPicked, { gov: governorateName(nearest, locale) }));
        } else {
          setGeoMessage(null);
        }
        setLocating(false);
      },
      () => {
        setGeoMessage(dict.geoDenied);
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  return (
    <form ref={formRef} action={action} className="space-y-5" noValidate>
      <input type="hidden" name="lang" value={locale} />

      {state.status === "ok" && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <p className="font-semibold">{dict.successTitle}</p>
          {state.productSlug && (
            <Link
              href={`/${locale}/products/${state.productSlug}`}
              className="mt-1 inline-block text-sm underline underline-offset-4"
            >
              {dict.successLink}
            </Link>
          )}
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
              {productName(p, locale)} ({locale === "ar" ? p.name_latin : p.name_ar})
            </option>
          ))}
        </select>
        <input
          type="hidden"
          name="product_slug"
          value={products.find((p) => String(p.id) === productId)?.slug ?? ""}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="price" className="block text-sm font-semibold">
          {dict.price}
        </label>
        <input
          id="price"
          name="price"
          inputMode="decimal"
          autoComplete="off"
          placeholder={dict.pricePlaceholder}
          required
          className={fieldClass}
        />
        <p className="text-xs text-neutral-500">{dict.priceHint}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="governorate_id" className="block text-sm font-semibold">
          {dict.governorate}
        </label>
        <select
          id="governorate_id"
          name="governorate_id"
          required
          value={governorateId}
          onChange={(e) => setGovernorateId(e.target.value)}
          className={fieldClass}
          aria-describedby="geo-help"
        >
          <option value="" disabled>
            {dict.chooseGovernorate}
          </option>
          {governorates.map((g) => (
            <option key={g.id} value={g.id}>
              {governorateName(g, locale)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={useMyPosition}
          disabled={locating}
          className="inline-flex h-10 items-center rounded-lg border border-neutral-300 bg-white px-3 text-sm hover:border-brand hover:text-brand-text disabled:opacity-60"
        >
          {locating ? dict.locating : dict.useMyPosition}
        </button>
        <p id="geo-help" className="text-xs text-neutral-500" aria-live="polite">
          {geoMessage ?? dict.geoIdle}
        </p>
        <input type="hidden" name="lat" value={lat} />
        <input type="hidden" name="lng" value={lng} />
      </div>

      <div className="space-y-2">
        <label htmlFor="address" className="block text-sm font-semibold">
          {dict.place} <span className="font-normal text-neutral-500">{dict.placeOptional}</span>
        </label>
        <input
          id="address"
          name="address"
          maxLength={120}
          placeholder={dict.placePlaceholder}
          autoComplete="off"
          className={fieldClass}
        />
        <p className="text-xs text-neutral-500">{dict.placeHint}</p>
      </div>

      {/* Honeypot: hidden from people, often filled by bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-brand text-base font-semibold text-on-brand shadow-sm hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? dict.submitting : dict.submit}
      </button>
      <p className="text-center text-xs text-neutral-500">{dict.privacy}</p>
    </form>
  );
}
