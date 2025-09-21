export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { resolveAffiliateUrl } from "@/lib/affmap";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const to = (url.searchParams.get("to") || "").toLowerCase();
  const q = url.searchParams.get("q") || "";
  const type = (url.searchParams.get("type") || "partner").toLowerCase();

  const base = new URL(req.url).origin;

  // Fire-and-forget tracking
  fetch(`${base}/api/track`, {
    method: "POST",
    body: JSON.stringify({ ts: Date.now(), to, type, q, ip: req.headers.get("x-forwarded-for") || "", ua: req.headers.get("user-agent") || "", ref: req.headers.get("referer") || "" }),
    headers: { "content-type":"application/json" }
  }).catch(()=>{});

  if (type === "subsite") {
    try {
      const res = await fetch(`${base}${process.env.NEXT_PUBLIC_SUBSITES_JSON}`, { cache: "force-cache" });
      const sites = await res.json();
      const hit = sites.find((s:any)=> s.slug?.toLowerCase() === to);
      if (hit?.url) return NextResponse.redirect(hit.url, { status: 302 });
    } catch {}
    return NextResponse.redirect(base || "/", { status: 302 });
  }

  const target = resolveAffiliateUrl(to as any, q);
  return NextResponse.redirect(target, { status: 302, headers: { "Cache-Control":"no-store" } });
}

