"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t, type Locale } from "@/lib/i18n";

const ICONS = {
  home: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4.35-4.35",
  submit: "M12 5v14M5 12h14",
  about: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 7v6m0-9v.01",
} as const;

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const dict = t(locale);
  const items = [
    { key: "home", href: `/${locale}`, label: dict.nav.home, icon: ICONS.home },
    { key: "search", href: `/${locale}/search`, label: dict.nav.search, icon: ICONS.search },
    { key: "submit", href: `/${locale}/submit`, label: dict.nav.submit, icon: ICONS.submit },
    { key: "about", href: `/${locale}/about`, label: dict.nav.about, icon: ICONS.about },
  ];

  return (
    <nav
      aria-label={dict.nav.label}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-4">
        {items.map((item) => {
          const active = item.key === "home" ? pathname === `/${locale}` : pathname.startsWith(item.href);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${
                  active ? "text-brand" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 2.2 : 1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
