import { t, type Locale } from "@/lib/i18n";

export const NAV_ICONS = {
  home: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4.35-4.35",
  submit: "M12 5v14M5 12h14",
  about: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 7v6m0-9v.01",
} as const;

export type NavKey = keyof typeof NAV_ICONS;

/** Navigation items shared by the top bar (desktop) and the bottom bar (mobile). */
export function navItems(locale: Locale) {
  const dict = t(locale).nav;
  return [
    { key: "home" as const, href: `/${locale}`, label: dict.home, icon: NAV_ICONS.home },
    { key: "search" as const, href: `/${locale}/search`, label: dict.search, icon: NAV_ICONS.search },
    { key: "submit" as const, href: `/${locale}/submit`, label: dict.submit, icon: NAV_ICONS.submit },
    { key: "about" as const, href: `/${locale}/about`, label: dict.about, icon: NAV_ICONS.about },
  ];
}

/** Whether a nav item matches the current path. The home item only matches exactly. */
export function isActive(pathname: string, locale: Locale, key: NavKey): boolean {
  if (key === "home") return pathname === `/${locale}`;
  const base = `/${locale}/${key}`;
  return pathname === base || pathname.startsWith(`${base}/`);
}
