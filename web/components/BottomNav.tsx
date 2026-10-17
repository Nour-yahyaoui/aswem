"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, navItems } from "@/lib/nav";
import { t, type Locale } from "@/lib/i18n";

/** Phone navigation. Hidden on wider screens, where the top bar takes over. */
export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const dict = t(locale);

  return (
    <nav
      aria-label={dict.nav.label}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95 md:hidden"
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-5">
        {navItems(locale).map((item) => {
          const active = isActive(pathname, locale, item.key);
          const Icon = item.icon;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium ${
                  active ? "text-brand-text" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
