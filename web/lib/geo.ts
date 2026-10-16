import type { Governorate } from "@/lib/types";

/** Returns the governorate whose centre is closest to the given point (approximate). */
export function nearestGovernorate(lat: number, lng: number, govs: Governorate[]): Governorate | undefined {
  const cosLat = Math.cos((lat * Math.PI) / 180);
  let best: Governorate | undefined;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const g of govs) {
    const dx = (lng - g.lng) * cosLat;
    const dy = lat - g.lat;
    const d = dx * dx + dy * dy;
    if (d < bestDist) {
      bestDist = d;
      best = g;
    }
  }
  return best;
}
