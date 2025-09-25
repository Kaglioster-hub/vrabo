import { NextResponse } from "next/server";
export const revalidate = 300;

export async function GET(req: Request){
  const url = new URL(req.url);
  const token = process.env.TRAVELPAYOUTS_KEY;
  const origin = (url.searchParams.get("origin")||"").toUpperCase();
  const destination = (url.searchParams.get("destination")||"").toUpperCase();
  const depart = url.searchParams.get("depart") || "";
  const ret = url.searchParams.get("return") || "";

  if(!token || !origin || !destination || !depart){
    return NextResponse.json({offers: []});
  }

  const qs = new URLSearchParams({
    origin, destination,
    departure_at: depart,
    return_at: ret || "",
    unique: "false", sorting:"price", direct:"false",
    currency:"EUR", limit:"12", token
  });
  if(!ret) qs.delete("return_at");

  try{
    const r = await fetch("https://api.travelpayouts.com/aviasales/v3/prices_for_dates?"+qs.toString(),
      { next: { revalidate: 300 }});
    const j = await r.json();
    const arr = Array.isArray(j?.data) ? j.data : [];
    const offers = arr.slice(0,12).map((x:any)=>({
      price:x.price, airline:x.airline, departure_at:x.departure_at,
      return_at:x.return_at, transfers:x.transfers, duration:x.duration,
      origin:x.origin, destination:x.destination
    }));
    return NextResponse.json({offers});
  }catch{
    return NextResponse.json({offers: []});
  }
}
