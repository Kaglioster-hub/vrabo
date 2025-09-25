import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge";

/**
 * Sorgenti supportate:
 * - CARS_PREVIEW_URL: URL del tuo microservizio che accetta ?city&pickup&dropoff e risponde:
 *   { prices:{ small:number|null, medium:number|null, large:number|null }, currency:"EUR" }
 * - CARS_PREVIEW_JSON: JSON statico per test (stesso shape).
 */
export async function GET(req: NextRequest){
  const u = new URL(req.url);
  const city = u.searchParams.get("city")||"";
  const pickup = u.searchParams.get("pickup")||"";
  const dropoff = u.searchParams.get("dropoff")||"";

  if(!city || !pickup || !dropoff){
    return NextResponse.json({ prices:null, currency:"EUR" }, { headers:{ "Cache-Control":"no-store" }});
  }

  const ext = process.env.CARS_PREVIEW_URL;
  if (ext) {
    try{
      const q = new URLSearchParams({ city, pickup, dropoff });
      const r = await fetch(`${ext}?${q.toString()}`, { cache:"no-store" } as RequestInit);
      if(r.ok){
        const j = await r.json();
        return NextResponse.json(j, { headers:{ "Cache-Control":"s-maxage=60" }});
      }
    }catch{}
  }

  const hard = process.env.CARS_PREVIEW_JSON;
  if (hard) {
    try{ const j = JSON.parse(hard); return NextResponse.json(j); }catch{}
  }

  return NextResponse.json({ prices:null, currency:"EUR" }, { headers:{ "Cache-Control":"no-store" }});
}
