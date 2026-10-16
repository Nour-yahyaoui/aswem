import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} | أسعار المواد في تونس`,
    short_name: SITE.name,
    description: SITE.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#047857",
    lang: "ar-TN",
    dir: "rtl",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
