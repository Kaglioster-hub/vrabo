export type Leg = { from: string; to: string; dep: string; arr: string; carrier?: string; flight_no?: string };
export type Option = {
  price: number | null;
  currency: string;
  duration: number; // min
  stops: number;
  summary: string;   // "Diretto • 2h 35m"
  deepLink: string;  // link finale provider
  legs: Leg[];
  score: number;     // per ranking qualità/prezzo
};

export function formatSummary(mins: number, stops: number) {
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${stops === 0 ? "Diretto" : stops === 1 ? "1 scalo" : `${stops} scali`} • ${h}h ${m}m`;
}

export function scoreOf(price: number | null, durMin: number, stops: number) {
  const p = price ?? 99999;
  return p * 0.6 + durMin * 0.3 + stops * 100; // pesi semplici
}

export function pickTop3(items: Option[]) {
  if (!items?.length) return [];
  const cheapest = [...items].sort((a,b)=>(a.price??1e9)-(b.price??1e9))[0];
  const fastest  = [...items].sort((a,b)=>a.duration-b.duration)[0];
  const best     = [...items].sort((a,b)=>a.score-b.score)[0];
  const uniq: Record<string, Option> = {};
  [cheapest, fastest, best].forEach(x=>{ if (x) uniq[x.deepLink] = x; });
  return Object.values(uniq).slice(0,3);
}
