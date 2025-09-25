import { Option, formatSummary, scoreOf, pickTop3 } from "./types";

// Costruttori link ricerca provider (usa i tuoi se già li hai)
function providerSearchLink(prov: string, q: { from: string; to: string; depart: string; ret?: string; adults?: number }) {
  const { from, to, depart, ret, adults=1 } = q;
  switch (prov) {
    case "KAYAK":
      return `https://www.kayak.it/flights/${from}-${to}/${depart}${ret?`/${ret}`:""}?adults=${adults}`;
    case "SKYSCANNER":
      return `https://www.skyscanner.it/trasporti/voli/${from}/${to}/${depart}/${ret??""}?adults=${adults}`;
    case "EXPEDIA":
      return `https://www.expedia.it/Flights-Search?trip=${ret?"roundtrip":"oneway"}&leg1=from:${from},to:${to},departure:${depart}TANYT&${ret?`leg2=from:${to},to:${from},departure:${ret}TANYT&`:""}passengers=adults:${adults}`;
    case "MOMONDO":
      return `https://www.momondo.it/flight-search/${from}-${to}/${depart}${ret?`/${ret}`:""}?adultsv2=${adults}`;
    case "KIWI":
    default:
      return `https://www.kiwi.com/it/search/results/${from}/${to}/${depart}${ret?`/${ret}`:""}?adults=${adults}`;
  }
}

// Adapter reale Kiwi (Tequila)
async function kiwiAdapter(q: { from: string; to: string; depart: string; ret?: string; adults?: number }): Promise<Option[]> {
  const key = process.env.TEQUILA_KEY!;
  const params: Record<string,string> = {
    partner: "picky",
    fly_from: q.from, fly_to: q.to,
    date_from: q.depart, date_to: q.depart,
    curr: "EUR", adults: String(q.adults ?? 1),
    limit: "30", sort: "price",
  };
  if (q.ret) { params.return_from = q.ret; params.return_to = q.ret; }
  const url = "https://tequila-api.kiwi.com/v2/search?" + new URLSearchParams(params).toString();
  const r = await fetch(url, { headers: { apikey: key }, cache: "no-store" });
  if (!r.ok) return [];
  const j = await r.json();
  const items: Option[] = (j.data || []).map((it: any) => {
    const durMin = Math.round((it.duration?.total ?? it.duration ?? 0) / 60);
    const stops  = Math.max(0, (it.route?.length || 1) - 1);
    return {
      price: it.price ?? null,
      currency: j.currency || "EUR",
      duration: durMin,
      stops,
      summary: formatSummary(durMin, stops),
      deepLink: it.deep_link,
      legs: (it.route||[]).map((s:any)=>({ from:s.flyFrom, to:s.flyTo, dep:s.local_departure, arr:s.local_arrival, carrier:s.airline, flight_no:String(s.flight_no||"") })),
      score: scoreOf(it.price ?? null, durMin, stops),
    } as Option;
  });
  return pickTop3(items);
}

// Proxy adapters: riusano i 3 migliori Kiwi ma con deepLink del provider
function proxyAdapter(provider: string) {
  return async (q: { from: string; to: string; depart: string; ret?: string; adults?: number }): Promise<Option[]> => {
    const base = await kiwiAdapter(q);
    const link = providerSearchLink(provider, q);
    return base.map(o => ({ ...o, deepLink: link }));
  };
}

export const flightPreviewAdapters: Record<string,(q:any)=>Promise<Option[]>> = {
  KIWI: kiwiAdapter,
  KAYAK: proxyAdapter("KAYAK"),
  SKYSCANNER: proxyAdapter("SKYSCANNER"),
  EXPEDIA: proxyAdapter("EXPEDIA"),
  MOMONDO: proxyAdapter("MOMONDO"),
};
