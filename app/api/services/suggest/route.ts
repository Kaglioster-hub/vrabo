import { NextResponse } from "next/server";
import { SERVICES } from "@/data/services";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const cat = (searchParams.get("category") || "all").toLowerCase();

  let list = SERVICES;
  if (cat !== "all") list = list.filter(s => s.category === cat);
  if (q) {
    list = list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.keywords.some(k => k.toLowerCase().includes(q))
    );
  }
  return NextResponse.json({ ok:true, items: list.slice(0, 12) });
}
