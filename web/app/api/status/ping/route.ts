export const dynamic = "force-dynamic";

/** Empty response used by the browser speed test. Measures the round trip to the web server. */
export function GET() {
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
