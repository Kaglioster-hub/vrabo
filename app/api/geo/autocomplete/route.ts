import { NextResponse } from "next/server";
import { AIR_ITEMS } from "@/data/air-lite";

const norm = (s: string) => (s || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase();

export async function GET(req: Request) {
  const q0 = new URL(req.url).searchParams.get("q")?.trim() || "";
  const q = norm(q0);
  if (!q) return NextResponse.json({ items: [] });

  const starts = AIR_ITEMS.filter(it =>
    norm(it.code).startsWith(q) || norm(it.label).startsWith(q)
  );
  const contains = AIR_ITEMS.filter(it =>
    !starts.includes(it) && (
      norm(it.code).includes(q) || norm(it.label).includes(q) || norm(it.sub || "").includes(q)
    )
  );
  const ranked = [...starts, ...contains]
    .sort((a, b) => b.pop - a.pop)
    .slice(0, 10);

  const items = ranked.map(it => ({
    id: it.code, label: it.label, sublabel: it.sub, code: it.code, type: it.type
  }));

  return NextResponse.json({ items });
}
