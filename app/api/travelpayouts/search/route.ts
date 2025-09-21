import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

// Simple proxy example (you'll adapt endpoint/params to your plan)
export async function GET(req: NextRequest) {
  try {
    const key = process.env.TRAVELPAYOUTS_KEY || "";
    if (!key) return NextResponse.json({ error: "Missing TRAVELPAYOUTS_KEY" }, { status: 400 });
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";
    // Example endpoint (placeholder) — update with the actual Travelpayouts API you use
    const api = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=MOW&destination=BCN&currency=EUR&sorting=price&limit=10&token=${key}`;
    const r = await fetch(api, { cache: "no-store" });
    const j = await r.json();
    return NextResponse.json({ ok: true, q: query, data: j });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
