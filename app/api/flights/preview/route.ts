import { NextRequest, NextResponse } from "next/server";
import { kiwiPreview } from "@/lib/tequila";
export const runtime = "edge";

export async function GET(req: NextRequest){
  const u = new URL(req.url);
  const from = u.searchParams.get("from")||"";
  const to = u.searchParams.get("to")||"";
  const depart = u.searchParams.get("depart")||"";
  const ret = u.searchParams.get("ret")||"";
  const adults = u.searchParams.get("adults")||"1";

  if(!from || !to || !depart) return NextResponse.json({ picks:null });

  const data = await kiwiPreview({ from, to, depart, ret, adults });
  return NextResponse.json(data||{ picks:null });
}
