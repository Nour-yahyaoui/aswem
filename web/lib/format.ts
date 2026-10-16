import { SITE } from "@/lib/site";

/** Formats integer millimes (1 TND = 1000 millimes) as "3.500 د.ت". */
export function formatTnd(millimes: number): string {
  return `${(millimes / 1000).toFixed(3)} د.ت`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ar-TN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: SITE.timeZone,
  }).format(new Date(iso));
}
