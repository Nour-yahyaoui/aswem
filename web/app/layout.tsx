import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { SITE } from "@/lib/site";
import { BottomNav } from "@/components/BottomNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | أسعار المواد في تونس`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "أسعار تونس",
    "ثمن المواد في تونس",
    "أسعار المواد الغذائية تونس",
    "prix Tunisie",
    "prix Monastir",
    "prix Ariana",
    "prix Sfax",
    "Tunisia prices",
    "aswem",
    "أسعم",
  ],
  authors: [{ name: SITE.author, url: SITE.github }],
  creator: SITE.author,
  publisher: SITE.author,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    url: SITE.url,
    title: `${SITE.name} | أسعار المواد في تونس`,
    description: SITE.shortDescription,
  },
  twitter: {
    card: "summary",
    title: `${SITE.name} | أسعار المواد في تونس`,
    description: SITE.shortDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#047857",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar-TN" dir="rtl">
      <body className="flex min-h-dvh flex-col bg-neutral-50 text-neutral-900 antialiased">
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
            <Link href="/" className="text-xl font-bold text-brand">
              {SITE.name}
            </Link>
            <span className="text-xs text-neutral-500" dir="ltr">
              {SITE.nameLatin}
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-5">{children}</main>
        <SiteFooter />
        <BottomNav />
      </body>
    </html>
  );
}
