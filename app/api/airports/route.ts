import { NextResponse } from "next/server";
import { normalizeAirport, Airport, TOP_AIRPORTS } from "@/utils/airports";

export const runtime = "edge";

const DATA_URL = process.env.NEXT_PUBLIC_AIRPORTS_DATA_URL
  || "https://raw.githubusercontent.com/algolia/datasets/master/airports/airports.json";

let cache: Airport[] | null = null;
let last = 0;

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v:number)=>v*Math.PI/180;
  const R = 6371;
  const dLat = toRad(lat2-lat1);
  const dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R*c;
}

async function loadAll(): Promise<Airport[]> {
  const now = Date.now();
  if (cache && (now - last) < 1000*60*60*24) return cache;
  try {
    const res = await fetch(DATA_URL, { next: { revalidate: 60*60*24 } });
    const arr = await res.json();
    const mapped: Airport[] = [];
    for (const a of arr) {
      const n = normalizeAirport(a);
      if (!n) continue;
      if (!n.iata_code) continue;
      mapped.push(n);
    }
    cache = mapped;
    last = now;
    return mapped;
  } catch {
    const sample = [
      { iata_code:"FCO", name:"Leonardo Da Vinci–Fiumicino", city:"Rome", country:"Italy" },
      { iata_code:"LHR", name:"Heathrow", city:"London", country:"United Kingdom" },
      { iata_code:"CDG", name:"Charles de Gaulle", city:"Paris", country:"France" },
      { iata_code:"JFK", name:"John F. Kennedy", city:"New York", country:"USA" },
      { iata_code:"DXB", name:"Dubai International", city:"Dubai", country:"UAE" },
      { iata_code:"SIN", name:"Changi", city:"Singapore", country:"Singapore" },
    ];
    return sample as Airport[];
  }
}

function match(a: Airport, q: string) {
  const hay = `${a.iata_code} ${a.name} ${a.city} ${a.country}`.toLowerCase();
  return hay.includes(q);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const top = url.searchParams.get("top");
  const iata = url.searchParams.get("iata");
  const near = url.searchParams.get("near"); // "lat,lng"

  const all = await loadAll();
  let results: Airport[] = [];

  if (iata) {
    results = all.filter(a => a.iata_code === iata.toUpperCase()).slice(0,1);
  } else if (near) {
    const [latS, lngS] = near.split(",").map(Number);
    results = [...all]
      .filter(a => a._geoloc)
      .map(a => ({ a, d: haversine(latS, lngS, a._geoloc!.lat, a._geoloc!.lng) }))
      .sort((x,y)=>x.d-y.d)
      .slice(0, 10)
      .map(x=>x.a);
  } else if (top) {
    const set = new Set(TOP_AIRPORTS);
    results = all.filter(a => a.iata_code && set.has(a.iata_code));
  } else if (q && q.length >= 2) {
    results = all.filter(a => match(a, q)).slice(0, 50);
  } else {
    results = all.slice(0, 50);
  }

  return NextResponse.json({ results });
}
