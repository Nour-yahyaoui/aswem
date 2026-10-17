import { Home, Info, ListChecks, PlusCircle, Search, type LucideIcon } from "lucide-react";
import { t, type Locale } from "@/lib/i18n";

export type NavKey = "home" | "search" | "list" | "submit" | "about";

export const NAV_ICONS: Record<NavKey, LucideIcon> = {
  home: Home,
  search: Search,
  list: ListChecks,
  submit: PlusCircle,
  about: Info,
};

/** Navigation items shared by the top bar (desktop) and the bottom bar (mobile). */
export function navItems(locale: Locale) {
  const dict = t(locale);
  return [
    { key: "home" as const, href: `/${locale}`, label: dict.nav.home, icon: NAV_ICONS.home },
    { key: "search" as const, href: `/${locale}/search`, label: dict.nav.search, icon: NAV_ICONS.search },
    { key: "list" as const, href: `/${locale}/list`, label: dict.ui.navList, icon: NAV_ICONS.list },
    { key: "submit" as const, href: `/${locale}/submit`, label: dict.nav.submit, icon: NAV_ICONS.submit },
    { key: "about" as const, href: `/${locale}/about`, label: dict.nav.about, icon: NAV_ICONS.about },
  ];
}

/** Whether a nav item matches the current path. The home item only matches exactly. */
export function isActive(pathname: string, locale: Locale, key: NavKey): boolean {
  if (key === "home") return pathname === `/${locale}`;
  const base = `/${locale}/${key}`;
  return pathname === base || pathname.startsWith(`${base}/`);
}
