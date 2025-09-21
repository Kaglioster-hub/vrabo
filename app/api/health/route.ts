import { NextResponse } from "next/server";
export async function GET() {
  const t = Date.now();
  return NextResponse.json({ ok: true, ts: t });
}
