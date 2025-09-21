import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  try {
    const b = await req.json().catch(()=>({}));
    console.log("[TRACK]", JSON.stringify(b));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
