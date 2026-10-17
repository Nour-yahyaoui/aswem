import type { Governorate } from "@/lib/types";

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance in kilometres between two points. */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function nearestGovernorate(lat: number, lng: number, govs: Governorate[]): Governorate | undefined {
  let best: Governorate | undefined;
  let bestKm = Infinity;
  for (const g of govs) {
    const km = distanceKm(lat, lng, g.lat, g.lng);
    if (km < bestKm) {
      best = g;
      bestKm = km;
    }
  }
  return best;
}
