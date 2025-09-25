import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(()=>({}));
  const { event="click", provider="", category="" } = body || {};
  // Semplice log server-side (puoi sostituirlo con storage/log service)
  console.log("[TRACK]", new Date().toISOString(), event, provider, category);
  return NextResponse.json({ ok:true });
}
