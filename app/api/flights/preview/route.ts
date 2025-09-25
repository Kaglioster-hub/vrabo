import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type Leg = { departure: string; arrival: string; duration: number; carrier: string; flight_no: string };
type Option = {
  provider: "KIWI";
  price: number;
  currency: string;
  duration: number; // minutes
  stops: number;
  score: number;    // qualità/prezzo
  summary: string;
  deepLink?: string;
  legs: Leg[];
};

function scoreOf(p: number, durMin: number, stops: number) {
  // euristica semplice: più basso è meglio
  return p + (durMin * 0.8) + (stops * 40);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const from = (url.searchParams.get("from")||"").toUpperCase();
  const to   = (url.searchParams.get("to")||"").toUpperCase();
  const depart = url.searchParams.get("depart")||"";
  const ret    = url.searchParams.get("ret")||"";
  const adults = url.searchParams.get("adults")||"1";

  const API = process.env.KIWI_TEQUILA_KEY;
  if (!API || !from || !to || !depart) {
    return NextResponse.json({ provider:"KIWI", items:[] as Option[] }, { headers: { "Cache-Control":"no-store" }});
  }

  const params = new URLSearchParams({
    fly_from: from, fly_to: to,
    date_from: depart, date_to: depart,
    return_from: ret || depart, return_to: ret || depart,
    adults, vehicle_type:"aircraft",
    sort:"price", limit:"20", curr:"EUR"
  });

  const r = await fetch("https://tequila-api.kiwi.com/v2/search?"+params.toString(), {
    headers: { apikey: API }
  });

  if (!r.ok) {
    return NextResponse.json({ provider:"KIWI", items:[] as Option[] }, { headers: { "Cache-Control":"no-store" }});
  }

  const j = await r.json();
  const items: Option[] = (j?.data||[]).map((it: any) => {
    const legs: Leg[] = (it.route||[]).map((s:any)=>({
      departure: s.local_departure,
      arrival:   s.local_arrival,
      duration:  s.duration?.total ? Math.round(s.duration.total/60) : 0,
      carrier:   s.airline,
      flight_no: String(s.flight_no||""),
    }));
    const durMin = (it.duration?.total ? Math.round(it.duration.total/60) : Math.round((it.duration||0)/60));
    const stops = Math.max(0, (it.route?.length||1) - 1);
    const s = scoreOf(it.price, durMin, stops);
    const summary = `${stops===0?"Diretto":stops===1?"1 scalo":stops+" scali"} • ${Math.floor(durMin/60)}h ${durMin%60}m`;
    return {
      provider:"KIWI",
      price: it.price,
      currency: (j.currency||"EUR"),
      duration: durMin,
      stops,
      score: s,
      summary,
      deepLink: it.deep_link,
      legs
    } as Option;
  }).sort((a:any,b:any)=> a.score - b.score).slice(0,3);

  return NextResponse.json({ provider:"KIWI", items }, { headers: { "Cache-Control":"no-store" }});
}
