import { NextResponse } from "next/server";
import { normalizeAirport, Airport, TOP_AIRPORTS } from "@/utils/airports";

export const runtime = "edge";

const DATA_URL = process.env.NEXT_PUBLIC_AIRPORTS_DATA_URL
  || "https://raw.githubusercontent.com/algolia/datasets/master/airports/airports.json";

let cache: Airport[] | null = null;
let last = 0;

const ALIASES: Record<string,string> = {
  "roma":"rome","milano":"milan","venezia":"venice","napoli":"naples","torino":"turin",
  "firenze":"florence","genova":"genoa","monaco di baviera":"munich","monaco":"munich",
  "londra":"london","nuova york":"new york","colonia":"cologne","bruxelles":"brussels",
  "mosca":"moscow","praga":"prague","siviglia":"seville","cracovia":"krakow","lisbona":"lisbon",
  "ati̇na":"athens","rivabella":"rimini"
};

function norm(s:string){ return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim(); }
function expandQueries(q:string){ const n = norm(q); return [n, ALIASES[n]].filter(Boolean) as string[]; }

function haversine(lat1:number, lon1:number, lat2:number, lon2:number){
  const R=6371, toRad=(v:number)=>v*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a))*R;
}

async function loadAll(): Promise<Airport[]> {
  const now = Date.now();
  if (cache && (now - last) < 1000*60*60*24) return cache;
  const res = await fetch(DATA_URL, { next: { revalidate: 60*60*24 } });
  const arr = await res.json();
  const mapped: Airport[] = [];
  for (const a of arr) {
    const n = normalizeAirport(a);
    if (n?.iata_code) mapped.push(n);
  }
  cache = mapped; last = now; return mapped;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const top = url.searchParams.get("top");
  const iata = url.searchParams.get("iata");
  const near = url.searchParams.get("near"); // "lat,lng"

  const all = await loadAll();
  let results: Airport[] = [];

  if (iata) {
    results = all.filter(a => a.iata_code === iata.toUpperCase()).slice(0,1);
  } else if (near) {
    const [latS, lngS] = (near||"").split(",").map(Number);
    results = [...all]
      .filter(a => a._geoloc)
      .map(a => ({ a, d: haversine(latS, lngS, a._geoloc!.lat, a._geoloc!.lng) }))
      .sort((x,y)=>x.d-y.d).slice(0, 10).map(x=>x.a);
  } else if (top) {
    const set = new Set(TOP_AIRPORTS);
    results = all.filter(a => a.iata_code && set.has(a.iata_code));
  } else if (q.trim().length >= 2) {
    const qs = expandQueries(q);
    results = all.filter(a => {
      const hay = norm(`${a.iata_code} ${a.name} ${a.city} ${a.country}`);
      return qs.some(qq => hay.includes(qq));
    }).slice(0, 50);
  } else {
    results = all.slice(0, 50);
  }

  return NextResponse.json({ results });
}
