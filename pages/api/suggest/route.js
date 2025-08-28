// app/api/suggest/route.js
import { NextResponse } from "next/server";

const TP_AUTOCOMPLETE = "https://autocomplete.travelpayouts.com/places2";
const FALLBACK = [
  { name: "Roma", code: "ROM", type: "city", country: "Italia" },
  { name: "Milano", code: "MIL", type: "city", country: "Italia" },
  { name: "Parigi", code: "PAR", type: "city", country: "Francia" },
];

function normalize(x) {
  return {
    name: x.name || x.city_name || "",
    code: x.code || x.iata_code || "",
    type: x.type || x.kind || "city",
    country: x.country_name || x.country || "",
    weight: x.weight || x.rate || 0,
  };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const lng = (searchParams.get("lng") || "it").trim();
  const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 50);

  if (!q) return NextResponse.json({ suggestions: FALLBACK });

  try {
    const url = `${TP_AUTOCOMPLETE}?term=${encodeURIComponent(q)}&locale=${lng}&types[]=city&types[]=airport&types[]=region&types[]=country&types[]=station`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    const suggestions = (j || []).map(normalize).slice(0, limit);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: FALLBACK });
  }
}
