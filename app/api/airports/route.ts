import { NextResponse } from "next/server";
import { normalizeAirport, Airport, TOP_AIRPORTS } from "@/utils/airports";

export const runtime = "edge";

const DATA_URL = process.env.NEXT_PUBLIC_AIRPORTS_DATA_URL
  || "https://raw.githubusercontent.com/algolia/datasets/master/airports/airports.json";

let cache: Airport[] | null = null;
let last = 0;

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
  } catch (e) {
    // Fallback to a small built-in set
    const sample = [
      { iata_code:"FCO", name:"Leonardo Da Vinci–Fiumicino", city:"Rome", country:"Italy" },
      { iata_code:"CIA", name:"Ciampino–G. B. Pastine", city:"Rome", country:"Italy" },
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

  const all = await loadAll();

  let results: Airport[] = [];
  if (top) {
    const set = new Set(TOP_AIRPORTS);
    results = all.filter(a => a.iata_code && set.has(a.iata_code));
  } else if (q && q.length >= 2) {
    results = all.filter(a => match(a, q)).slice(0, 50);
  } else {
    results = all.slice(0, 50);
  }

  return NextResponse.json({ results });
}
