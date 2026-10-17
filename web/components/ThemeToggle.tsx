"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { t, type Locale } from "@/lib/i18n";
import { THEME_STORAGE_KEY } from "@/lib/theme";

/** Switches between light and dark mode and remembers the choice. */
export function ThemeToggle({ locale }: { locale: Locale }) {
  const dict = t(locale).theme;
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Storage can be blocked (private mode); the switch still works for this visit.
    }
    setDark(next);
  }

  const label = dark ? dict.light : dict.dark;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-pressed={dark}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 hover:border-brand hover:text-brand-text dark:border-neutral-700 dark:text-neutral-200"
    >
      {dark ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
    </button>
  );
}
