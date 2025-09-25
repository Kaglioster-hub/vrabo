type Q = { from:string; to:string; depart:string; ret?:string; pax:number; cabin?:"economy"|"premiumeconomy"|"business"|"first"; directOnly?:boolean };
const fmt = (d:string)=> d.replace(/-/g,"");

/** Google Flights (NOTE: i passeggeri non sono affidabili via URL public) */
export function buildGoogleFlightsURL(q:Q){
  const seg1 = `${q.from}.${q.to}.${fmt(q.depart)}`;
  const seg2 = q.ret ? `;${q.to}.${q.from}.${fmt(q.ret)}` : "";
  const base = `https://www.google.com/travel/flights?hl=it&gl=it&q=${encodeURIComponent(q.to)}`;
  const tfs  = `&tfs=CBwQAhopEgoyMDI0LTEyLTAxagwIAhIIL20vMDEyeG4SCjIwMjQtMTItMDIaKAoa${seg1}${seg2}`;
  return base+tfs; // Google ignora spesso pax: usiamo Skyscanner per pax affidabili
}

/** Skyscanner deep link (pax/cabin/direct) */
export function buildSkyscannerURL(q:Q){
  const depart = fmt(q.depart);
  const ret = q.ret ? `/${fmt(q.ret)}/${q.pax}` : `/${q.pax}?trip=oneway`;
  const params = new URLSearchParams();
  params.set("adults", String(q.pax));
  params.set("cabinclass", q.cabin || "economy");
  if(q.directOnly) params.set("preferdirects", "true");
  return `https://www.skyscanner.it/trasporti/voli/${q.from}/${q.to}/${depart}${ret}/?${params.toString()}`;
}
