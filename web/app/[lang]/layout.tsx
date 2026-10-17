import type { Metadata, Viewport } from "next";
import "../globals.css";
import { BottomNav } from "@/components/BottomNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { dirOf, LOCALES, t } from "@/lib/i18n";
import { parseLocale } from "@/lib/locale";
import { SITE } from "@/lib/site";
import { THEME_SCRIPT } from "@/lib/theme";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = parseLocale((await params).lang);
  const dict = t(locale);
  const title = `${dict.brand} | ${locale === "ar" ? "أسعار المواد في تونس" : "Prix des produits en Tunisie"}`;
  return {
    metadataBase: new URL(SITE.url),
    title: { default: title, template: `%s | ${dict.brand}` },
    description: dict.description,
    applicationName: dict.brand,
    keywords: [
      "أسعار تونس",
      "ثمن المواد في تونس",
      "prix Tunisie",
      "prix Monastir",
      "prix Ariana",
      "prix Sfax",
      "prix supermarché Tunisie",
      "Tunisia prices",
      "aswem",
      "أسوام",
    ],
    authors: [{ name: SITE.author, url: SITE.github }],
    creator: SITE.author,
    publisher: SITE.author,
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_TN" : "fr_TN",
      alternateLocale: locale === "ar" ? ["fr_TN"] : ["ar_TN"],
      siteName: dict.brand,
      url: `${SITE.url}/${locale}`,
      title,
      description: dict.tagline,
    },
    twitter: { card: "summary", title, description: dict.tagline },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#047857" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f0d" },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const locale = parseLocale((await params).lang);
  const dict = t(locale);

  return (
    <html lang={dict.htmlLang} dir={dirOf(locale)} suppressHydrationWarning>
      <head>
        {/* Applies the saved theme before paint, so there is no flash of the wrong colours. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col bg-neutral-50 text-neutral-900 antialiased">
        <SiteHeader locale={locale} />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-5 sm:px-6 md:max-w-5xl md:pb-10 md:pt-8">{children}</main>
        <SiteFooter locale={locale} />
        <BottomNav locale={locale} />
      </body>
    </html>
  );
}
