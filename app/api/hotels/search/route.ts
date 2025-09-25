import { NextResponse } from "next/server";
import { affiliates } from "@/config/affiliates";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q        = searchParams.get("q") || "";
  const checkin  = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const adults   = Number(searchParams.get("adults") || "2");

  const items = [
    { provider: "Booking.com", url: affiliates.booking.buildUrl({ q, checkin, checkout, adults }) },
    { provider: "Trip.com",    url: affiliates.tripcom.buildHotel({ q, checkin, checkout, adults }) },
    { provider: "Agoda",       url: affiliates.agoda.buildUrl({ q, checkin, checkout, adults }) },
    { provider: "Expedia",     url: affiliates.expedia.buildUrl({ q, checkin, checkout, adults }) },
    { provider: "Airbnb",      url: affiliates.airbnb.buildUrl({ q, checkin, checkout, adults }) },
    { provider: "Stay22",      url: affiliates.stay22.buildUrl({ q, checkin, checkout, adults }) },
  ];

  return NextResponse.json({ ok: true, items });
}
