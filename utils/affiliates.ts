export type TripQuery = {
  from: string;
  to: string;
  depart: string; // YYYY-MM-DD
  return?: string | null;
  adults?: number;
  children?: number;
  infants?: number;
  cabin?: "economy"|"premiumeconomy"|"business"|"first";
};

function yyyymmdd(d: string) {
  return d.replaceAll("-", "");
}

const src = process.env.AFF_SOURCE || "vrabo";
const med = process.env.AFF_MEDIUM || "affiliate";
const camp = process.env.AFF_CAMPAIGN || "global";

export function skyscannerLink(q: TripQuery) {
  // Generic deeplink with UTM tags; add your Associate ID per your contract if applicable.
  const base = "https://www.skyscanner.net/transport/flights";
  const d1 = yyyymmdd(q.depart);
  const d2 = q.return ? yyyymmdd(q.return) : "";
  const path = `/${q.from}/${q.to}/${d1}${d2 ? "/" + d2 : ""}`;
  const params = new URLSearchParams({
    adults: String(q.adults || 1),
    children: String(q.children || 0),
    infants: String(q.infants || 0),
    cabinclass: q.cabin || "economy",
    utm_source: src, utm_medium: med, utm_campaign: camp,
  });
  return `${base}${path}?${params.toString()}`;
}

export function kiwiLink(q: TripQuery) {
  // Kiwi.com deeplink pattern (no affiliate param added here; set up via account and use subid via utm_*)
  const base = "https://www.kiwi.com/en/search/";
  const d1 = q.depart;
  const d2 = q.return || "";
  const path = `${q.from}-${q.to}/${d1}${d2 ? "_" + d2 : ""}`;
  const params = new URLSearchParams({ utm_source: src, utm_medium: med, utm_campaign: camp });
  return `${base}${path}?${params.toString()}`;
}

export function bookingHotelLink(city: string, checkin: string, checkout: string, adults=2) {
  const aid = process.env.BOOKING_AID || "";
  const base = "https://www.booking.com/searchresults.html";
  const params = new URLSearchParams({
    ss: city,
    checkin, checkout,
    group_adults: String(adults),
    no_rooms: "1",
    group_children: "0",
    aid,
    utm_source: src, utm_medium: med, utm_campaign: camp,
  });
  return `${base}?${params.toString()}`;
}

export function rentalcarsLink(city: string, pick: string, drop: string) {
  const code = process.env.RENTALCARS_AFFILIATE_CODE || "";
  const base = "https://www.rentalcars.com/Home.do";
  const params = new URLSearchParams({
    affiliateCode: code,
    fts_search_type: "place",
    fts_type: "A",
    fts_searchLocationVal: city,
    pickup: pick,
    dropoff: drop,
    utm_source: src, utm_medium: med, utm_campaign: camp,
  });
  return `${base}?${params.toString()}`;
}
