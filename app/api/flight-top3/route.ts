import { NextResponse } from "next/server";
export const runtime = "edge";

type Raw = any;
type Offer = {
  label: "cheap"|"best"|"fast";
  price: number; currency: string;
  carriers: string[]; stops: number;
  duration: string;
  dep: string; arr: string;
  deepLink: string;
};

const toKiwiDate = (iso: string)=>{ const [y,m,d] = iso.split("-"); return `${d}/${m}/${y}`; }
const fmtDur = (min: number)=>{ const h=Math.floor(min/60),mm=Math.round(min%60); return `${h}h ${mm.toString().padStart(2,"0")}m`; }
const norm = (x: Raw): Offer | null => {
  if(!x) return null as any;
  const carriers = Array.from(new Set((x.route||[]).map((r:any)=> r.airline))).slice(0,3);
  const dep = x.local_departure || x.utc_departure, arr = x.local_arrival || x.utc_arrival;
  return { label:"best", price:x.price, currency:x.currency||"EUR", carriers,
    stops: Math.max(0,(x.route?.length||1)-1), duration: fmtDur((x.duration?.total||0)/60),
    dep, arr, deepLink: x.deep_link||"" };
}

export async function GET(req: Request) {
  const api = process.env.TEQUILA_API_KEY;
  if(!api) return NextResponse.json({error:"Missing TEQUILA_API_KEY"}, {status:500});
  const url = new URL(req.url);
  const from   = (url.searchParams.get("from")||"").toUpperCase();
  const to     = (url.searchParams.get("to")||"").toUpperCase();
  const depart = url.searchParams.get("depart")||"";
  const ret    = url.searchParams.get("ret")||"";
  const adults = url.searchParams.get("adults")||"1";
  const curr   = url.searchParams.get("curr")||"EUR";
  if(!from||!to||!depart) return NextResponse.json({error:"bad_query"}, {status:400});

  const p = new URLSearchParams({
    fly_from:from, fly_to:to, date_from:toKiwiDate(depart), date_to:toKiwiDate(depart),
    adults, curr, limit:"120", one_for_city:"0"
  });
  if(ret){ p.set("return_from",toKiwiDate(ret)); p.set("return_to",toKiwiDate(ret)); }
  const r = await fetch("https://api.tequila.kiwi.com/v2/search?"+p.toString(), {
    headers:{ apikey: api }, next:{ revalidate: 60 }
  });
  if(!r.ok) return NextResponse.json({error:"upstream", status:r.status}, {status:502});
  const j = await r.json(); const data: Raw[] = j.data||[];

  const byPrice=[...data].sort((a,b)=>(a.price||9e9)-(b.price||9e9));
  const byDur  =[...data].sort((a,b)=>(a.duration?.total||9e9)-(b.duration?.total||9e9));
  const score=(x:Raw)=> (x.quality??0) - (x.duration?.total||0)/100000 - (x.price||0)/1000;
  const byBest=[...data].sort((a,b)=> score(b)-score(a));

  const cheapest = norm(byPrice[0]); if(cheapest) cheapest.label="cheap";
  const fastest  = norm(byDur[0]);   if(fastest)  fastest.label="fast";
  const best     = norm(byBest[0]);  if(best)     best.label="best";

  return NextResponse.json({ currency: curr, cheapest, fastest, best }, {
    headers: { "Cache-Control":"public, s-maxage=60, stale-while-revalidate=300" }
  });
}
