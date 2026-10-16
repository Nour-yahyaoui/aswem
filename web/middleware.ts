import { NextRequest, NextResponse } from "next/server";

/**
 * Sends the bare root to the visitor's language. French browsers get /fr, everyone else /ar.
 * Uses a temporary redirect so the choice can change later.
 */
export function middleware(req: NextRequest) {
  const preferred = (req.headers.get("accept-language") ?? "").split(",")[0]?.trim().toLowerCase() ?? "";
  const locale = preferred.startsWith("fr") ? "fr" : "ar";
  return NextResponse.redirect(new URL(`/${locale}`, req.url), 307);
}

export const config = {
  matcher: ["/"],
};
