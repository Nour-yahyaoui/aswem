"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitPrice, type SubmitState } from "@/app/submit/actions";
import { nearestGovernorate } from "@/lib/geo";
import type { Governorate, Product } from "@/lib/types";
import Link from "next/link";

const initial: SubmitState = { status: "idle" };

const fieldClass =
  "h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export function SubmitForm({
  products,
  governorates,
  defaultProductId,
}: {
  products: Product[];
  governorates: Governorate[];
  defaultProductId?: number;
}) {
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
      setGeoMessage("المتصفح ما يعطيش الموقع. اختار الولاية يدوياً.");
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
        if (nearest) setGovernorateId(String(nearest.id));
        setGeoMessage(nearest ? `تم اختيار ولاية ${nearest.name_ar} من موقعك. تقدر تبدلها.` : null);
        setLocating(false);
      },
      () => {
        setGeoMessage("ما تنجمش نحدد موقعك. اختار الولاية يدوياً.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  return (
    <form ref={formRef} action={action} className="space-y-5" noValidate>
      {state.status === "ok" && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <p className="font-semibold">شكراً! الثمن تسجل.</p>
          {state.productSlug && (
            <Link href={`/products/${state.productSlug}`} className="mt-1 inline-block text-sm underline underline-offset-4">
              شوف الأسعار الجديدة
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
        <label htmlFor="product_id" className="block text-sm font-semibold">المادة</label>
        <select
          id="product_id"
          name="product_id"
          required
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className={fieldClass}
        >
          <option value="" disabled>اختار المادة</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name_ar} ({p.name_latin})
            </option>
          ))}
        </select>
        <input type="hidden" name="product_slug" value={products.find((p) => String(p.id) === productId)?.slug ?? ""} />
      </div>

      <div className="space-y-2">
        <label htmlFor="price" className="block text-sm font-semibold">الثمن بالدينار</label>
        <input
          id="price"
          name="price"
          inputMode="decimal"
          autoComplete="off"
          placeholder="مثلاً 3.500"
          required
          className={fieldClass}
        />
        <p className="text-xs text-neutral-500">كتبه بالدينار، مثلاً 3.500 أو 3,5</p>
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-semibold">الولاية</span>
        <select
          id="governorate_id"
          name="governorate_id"
          required
          value={governorateId}
          onChange={(e) => setGovernorateId(e.target.value)}
          className={fieldClass}
          aria-describedby="geo-help"
        >
          <option value="" disabled>اختار الولاية</option>
          {governorates.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name_ar} ({g.name_latin})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={useMyPosition}
          disabled={locating}
          className="inline-flex h-10 items-center rounded-lg border border-neutral-300 bg-white px-3 text-sm hover:border-brand hover:text-brand disabled:opacity-60"
        >
          {locating ? "نحدد موقعك…" : "استعمل موقعي"}
        </button>
        <p id="geo-help" className="text-xs text-neutral-500" aria-live="polite">
          {geoMessage ?? "موقعك ما يتسجلش بالدقة، نحفظو تقريبي برك."}
        </p>
        <input type="hidden" name="lat" value={lat} />
        <input type="hidden" name="lng" value={lng} />
      </div>

      <div className="space-y-2">
        <label htmlFor="address" className="block text-sm font-semibold">
          المحل أو المنطقة <span className="font-normal text-neutral-500">(اختياري إذا استعملت موقعك)</span>
        </label>
        <input
          id="address"
          name="address"
          maxLength={120}
          placeholder="مثلاً: سوبرماركت، حي النصر"
          autoComplete="off"
          className={fieldClass}
        />
        <p className="text-xs text-neutral-500">اكتب اسم المحل أو المنطقة فقط. لا تكتب عنوان دارك.</p>
      </div>

      {/* Honeypot: hidden from people, often filled by bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-brand text-base font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "نسجلو…" : "إرسال الثمن"}
      </button>
      <p className="text-center text-xs text-neutral-500">مجاني، بلا تسجيل. ما نحفظوش صورك ولا بياناتك الشخصية.</p>
    </form>
  );
}
