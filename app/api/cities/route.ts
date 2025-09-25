import { NextResponse } from "next/server";
export const runtime = "edge";
type City = { name:string; country:string };
const TOP_CITIES: City[] = [
  {name:"Rome", country:"Italy"},{name:"Milan", country:"Italy"},{name:"Paris", country:"France"},
  {name:"Barcelona", country:"Spain"},{name:"London", country:"United Kingdom"},{name:"New York", country:"United States"},
  {name:"Dubai", country:"United Arab Emirates"},{name:"Istanbul", country:"Turkey"},{name:"Tokyo", country:"Japan"},
  {name:"Bangkok", country:"Thailand"},{name:"Berlin", country:"Germany"},{name:"Amsterdam", country:"Netherlands"}
];
const uniq = <T,>(arr:T[], key:(x:T)=>string)=>{const s=new Set<string>();const out:T[]=[];for(const x of arr){const k=key(x);if(!s.has(k)){s.add(k);out.push(x)}}return out};
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json({ results: TOP_CITIES });
  try {
    const api = `https://api.teleport.org/api/cities/?search=${encodeURIComponent(q)}&limit=25`;
    const r = await fetch(api, { next: { revalidate: 86400 } });
    const j = await r.json() as any;
    const rows: City[] = (j?._embedded?.['city:search-results'] || []).map((it:any) => {
      const full: string = it?.matching_full_name || "";
      const parts = full.split(',').map((s)=>s.trim());
      const name = parts[0] || q;
      const country = parts.at(-1) || "";
      return { name, country };
    });
    const results = uniq(rows, (x)=>`${x.name}|${x.country}`).slice(0, 30);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: TOP_CITIES });
  }
}
