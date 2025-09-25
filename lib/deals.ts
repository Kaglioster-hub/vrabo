import { DEFAULT_DEALS, type Deal, type DealMode } from "@/config/deals";
export async function getDeals(mode: DealMode): Promise<Record<string, Deal>> {
  const src = process.env.NEXT_PUBLIC_DEALS_JSON_URL;
  if (src) {
    try { const r = await fetch(src, { next: { revalidate: 600 } }); const j = await r.json();
      if (j && typeof j === "object" && j[mode]) return j[mode] as Record<string, Deal>; } catch {}
  }
  return DEFAULT_DEALS[mode] || {};
}
