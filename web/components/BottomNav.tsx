"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "الرئيسية", icon: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { href: "/search", label: "بحث", icon: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4.35-4.35" },
  { href: "/submit", label: "زيد ثمن", icon: "M12 5v14M5 12h14" },
  { href: "/about", label: "عن الموقع", icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 7v6m0-9v.01" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-4">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
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
