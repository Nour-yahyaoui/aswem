"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { Product } from "@/lib/types";

/** Search input with live suggestions. Submitting the form opens the full results page. */
export function SearchBox({ defaultValue = "", autoFocus = false }: { defaultValue?: string; autoFocus?: boolean }) {
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const listId = useId();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (!res.ok) return;
        setSuggestions((await res.json()) as Product[]);
      } catch {
        // Aborted or offline: keep the last suggestions.
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative">
      <form action="/search" method="get" role="search" className="flex gap-2">
        <input
          type="search"
          name="q"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="اكتب المادة: حليب، زيت، سكر…"
          aria-label="بحث عن مادة"
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          enterKeyHint="search"
          autoFocus={autoFocus}
          maxLength={80}
          className="h-12 flex-1 rounded-xl border border-neutral-300 bg-white px-4 text-base shadow-sm placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        <button
          type="submit"
          className="h-12 rounded-xl bg-brand px-5 text-base font-semibold text-white shadow-sm hover:bg-emerald-800"
        >
          بحث
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-14 z-20 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg"
        >
          {suggestions.map((p) => (
            <li key={p.id} role="option" aria-selected="false">
              <Link href={`/products/${p.slug}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-brand-soft">
                <span className="font-medium">{p.name_ar}</span>
                <span className="text-xs text-neutral-500" dir="ltr">
                  {p.name_latin}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
