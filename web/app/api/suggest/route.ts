import { NextRequest, NextResponse } from "next/server";
import { tryApiGet } from "@/lib/api";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Proxies live search suggestions so the browser never needs the API URL. */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) {
    return NextResponse.json([], { headers: { "Cache-Control": "public, max-age=60" } });
  }

  const { data, failed } = await tryApiGet<Product[]>(
    `/search?${new URLSearchParams({ q, limit: "6" })}`,
    60,
  );
  if (failed) {
    return NextResponse.json([], { status: 503 });
  }
  return NextResponse.json(data ?? [], {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
