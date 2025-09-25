import { NextResponse } from "next/server";
import { getDeals } from "@/lib/deals";
export const runtime = "edge";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") || "telco") as any;
  const deals = await getDeals(mode);
  return NextResponse.json({ mode, deals });
}
