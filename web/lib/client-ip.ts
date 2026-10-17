import "server-only";

/**
 * Picks the visitor's address from X-Forwarded-For. Each proxy appends to the right-hand end,
 * so the last entry is the one added by the platform. The first entry is supplied by the client
 * and can be forged, so it is never used.
 */
export function clientIpFrom(forwardedFor: string | null): string {
  const parts = (forwardedFor ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const ip = parts[parts.length - 1] ?? "unknown";
  return ip.slice(0, 64);
}
