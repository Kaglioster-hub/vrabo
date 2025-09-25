import { NextResponse } from "next/server";
import { flightPreviewAdapters } from "@/utils/flights/adapters";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const from   = (u.searchParams.get("from")||"").toUpperCase();
  const to     = (u.searchParams.get("to")||"").toUpperCase();
  const depart = u.searchParams.get("depart")||"";
  const ret    = u.searchParams.get("ret")||"";
  const adults = Number(u.searchParams.get("adults")||"1") || 1;
  if (!from || !to || !depart) return NextResponse.json({ error:"missing params" }, { status:400 });

  const provParam = (u.searchParams.get("prov")||"ALL").toUpperCase();
  const keys = provParam==="ALL"
    ? Object.keys(flightPreviewAdapters)
    : provParam.split(",").map(s=>s.trim()).filter(Boolean).filter(k=>flightPreviewAdapters[k]);

  const q = { from, to, depart, ret: ret || undefined, adults };

  const entries = await Promise.all(keys.map(async (k) => {
    try { return [k, await flightPreviewAdapters[k](q)] as const; }
    catch { return [k, []] as const; }
  }));

  const results: Record<string, any[]> = {};
  entries.forEach(([k, v]) => { results[k] = v; });

  return NextResponse.json(
    { providers: keys, results },
    { headers: { "Cache-Control":"public, s-maxage=60, stale-while-revalidate=60" } }
  );
}
