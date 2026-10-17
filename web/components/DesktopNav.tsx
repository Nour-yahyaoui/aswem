"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, navItems } from "@/lib/nav";
import { t, type Locale } from "@/lib/i18n";

/** Top navigation for wider screens. Hidden on phones, where the bottom bar is used. */
export function DesktopNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const dict = t(locale);

  return (
    <nav aria-label={dict.nav.label} className="hidden md:block">
      <ul className="flex items-center gap-1">
        {navItems(locale).map((item) => {
          const active = isActive(pathname, locale, item.key);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium ${
                  active ? "bg-brand-soft text-brand-text" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
