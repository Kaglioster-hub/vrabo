export type Cabin = "economy"|"premium_economy"|"business"|"first";
type Q = { from:string; to:string; depart:string; ret?:string; pax?:number; direct?:boolean; cabin?:Cabin };
const fmt = (d:string)=> d.replace(/-/g,"");

export function googleFlightsURL(q:Q){
  const seg = `${q.from}.${q.to}.${fmt(q.depart)}` + (q.ret ? `*${q.to}.${q.from}.${fmt(q.ret)}` : "");
  const pax = Math.max(1, Math.min(9, q.pax ?? 1));
  const clsMap:Record<Cabin,string> = {economy:"e:1",premium_economy:"e:2",business:"e:3",first:"e:4"};
  const cls = clsMap[q.cabin ?? "economy"];
  const dir = q.direct ? ";sc:d" : "";
  return `https://www.google.com/travel/flights?hl=it#flt=${seg};c:EUR;${cls};p:${pax}${dir}`;
}

export function skyscannerURL(q:Q){
  const depart = fmt(q.depart);
  const ret = q.ret ? `/${fmt(q.ret)}/${Math.max(1,Math.min(9,q.pax??1))}` : `/${Math.max(1,Math.min(9,q.pax??1))}?trip=oneway`;
  return `https://www.skyscanner.it/trasporti/voli/${q.from}/${q.to}/${depart}${ret}/`;
}

export function tripHotelURL({ city, checkin, checkout, rooms=1, adults=2, children=0 }:{
  city:string; checkin:string; checkout:string; rooms?:number; adults?:number; children?:number;
}){
  const base = process.env.NEXT_PUBLIC_AFF_ID_HOTEL || "https://www.trip.com/";
  const u = new URL(base);
  const add = (k:string,v:string)=>{ if(v) u.searchParams.set(k,v) };
  add("searchCity", city);
  add("checkIn", checkin);
  add("checkOut", checkout);
  add("rooms", String(rooms));
  add("adults", String(adults));
  add("children", String(children));
  add("locale", "it-IT");
  return u.toString();
}

export function carURL({ preferLocalrent=false }:{ preferLocalrent?:boolean } = {}){
  const localrent = process.env.NEXT_PUBLIC_AFF_ID_CAR2 || "";
  const trip      = process.env.NEXT_PUBLIC_AFF_ID_CAR  || "https://www.trip.com/car-rental/";
  return preferLocalrent && localrent ? localrent : (trip || localrent);
}

export function gygURL(city:string, date?:string){
  const base = process.env.NEXT_PUBLIC_AFF_ID_TICKETS1 || "https://www.getyourguide.com/";
  const u = new URL(base);
  if(!u.searchParams.get("partner_id")) u.searchParams.set("partner_id","9IDBTNP");
  u.pathname = "/s/"; u.searchParams.set("q", city);
  if(date) u.searchParams.set("date", date);
  return u.toString();
}
