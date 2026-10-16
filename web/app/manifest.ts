import type { MetadataRoute } from "next";
import { t } from "@/lib/i18n";

export default function manifest(): MetadataRoute.Manifest {
  const ar = t("ar");
  return {
    name: `${ar.brand} | أسعار المواد في تونس`,
    short_name: ar.brand,
    description: ar.tagline,
    start_url: "/ar",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#047857",
    lang: "ar-TN",
    dir: "rtl",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
