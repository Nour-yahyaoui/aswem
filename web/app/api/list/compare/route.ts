import { tryApiGet } from "@/lib/api";
import { buildPlan, parseCompareRequest } from "@/lib/advisor";
import type { Governorate, ProductPrices } from "@/lib/types";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store" };

/** Builds a shopping plan for a list of products from the observed prices. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid request body" }, { status: 400, headers });
  }

  const parsed = parseCompareRequest(body);
  if (!parsed) return Response.json({ error: "invalid request" }, { status: 400, headers });

  const govs = await tryApiGet<Governorate[]>("/governorates", 86400);
  if (govs.failed || !govs.data) return Response.json({ error: "unavailable" }, { status: 503, headers });
  if (!govs.data.some((g) => g.id === parsed.governorateId)) {
    return Response.json({ error: "unknown governorate" }, { status: 400, headers });
  }

  const prices = await Promise.all(
    parsed.items.map((slug) => tryApiGet<ProductPrices>(`/products/${encodeURIComponent(slug)}/prices`, 120)),
  );
  if (prices.some((p) => p.failed)) return Response.json({ error: "unavailable" }, { status: 503, headers });

  const list = parsed.items.map((slug, i) => ({ slug, stats: prices[i].data?.by_governorate ?? [] }));
  const plan = buildPlan(list, parsed.governorateId, govs.data);
  return Response.json(plan, { headers });
}
