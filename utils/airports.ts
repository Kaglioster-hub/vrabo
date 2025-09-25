export type Airport = {
  iata_code: string | null;
  name: string;
  city: string;
  country: string;
  _geoloc?: { lat: number; lng: number };
};

export function normalizeAirport(a: any): Airport | null {
  const code = a.iata_code || a.iata || a.code || null;
  if (!code) return null;
  return {
    iata_code: String(code).toUpperCase(),
    name: a.name || a.airport || a.fullname || "",
    city: a.city || a.city_name || a.municipality || "",
    country: a.country || a.country_name || a.iso_country || "",
    _geoloc: a._geoloc || (a.latitude && a.longitude ? { lat: +a.latitude, lng: +a.longitude } : undefined),
  };
}

export function displayAirport(a: Airport) {
  const loc = [a.city, a.country].filter(Boolean).join(", ");
  return `${a.iata_code} — ${a.name}${loc ? " · " + loc : ""}`;
}

export const TOP_AIRPORTS = [
  "FCO","MXP","LIN","CIA","VCE","LHR","LGW","CDG","ORY","AMS","MAD","BCN","JFK","EWR","LAX","SFO","IST","DXB","SIN","HND","NRT","SYD","GRU","YYZ"
];
