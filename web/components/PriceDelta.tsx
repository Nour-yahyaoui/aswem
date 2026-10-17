import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { t, type Locale } from "@/lib/i18n";
import { formatSigned, type Delta } from "@/lib/trading";

/**
 * Trading-style movement chip. For buyers a rise is bad (red) and a fall is good (green).
 * Values are in millimes, shown with an explicit sign.
 */
export function PriceDelta({ delta, locale, label }: { delta: Delta; locale: Locale; label?: string }) {
  const dict = t(locale).ui.trading;
  const Icon = delta.direction === "up" ? TrendingUp : delta.direction === "down" ? TrendingDown : Minus;
  const tone =
    delta.direction === "up"
      ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300"
      : delta.direction === "down"
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
        : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300";
  const word = delta.direction === "up" ? dict.up : delta.direction === "down" ? dict.down : dict.flat;
  const amount = `${formatSigned(delta.millimes)} ${dict.unit}`;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${tone}`}
      aria-label={label ? `${label}: ${word} ${amount}` : `${word} ${amount}`}
    >
      <Icon size={13} aria-hidden="true" />
      <span dir="ltr">{formatSigned(delta.millimes)}</span>
      <span>{dict.unit}</span>
    </span>
  );
}
