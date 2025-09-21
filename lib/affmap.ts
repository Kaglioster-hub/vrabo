export type AffKey =
  | "trip_hotels" | "trip_flights" | "trip_cars" | "localrent"
  | "gyg" | "tiqets" | "ticketnetwork"
  | "yesim" | "airalo" | "drimsim"
  | "compensair" | "binance_cpa"
  | "amazon"
  | "booking" | "skyscanner" | "rentalcars" | "trainline" | "ticketmaster"
  | "ebay" | "decathlon" | "aliexpress" | "etsy";

// Prefer direct NEXT_PUBLIC_* (client-safe) URLs
const pub = {
  HOTEL: process.env.NEXT_PUBLIC_AFF_ID_HOTEL,
  BNB: process.env.NEXT_PUBLIC_AFF_ID_BNB,
  FLIGHT: process.env.NEXT_PUBLIC_AFF_ID_FLIGHT,
  FLIGHT2: process.env.NEXT_PUBLIC_AFF_ID_FLIGHT2,
  FLIGHT3: process.env.NEXT_PUBLIC_AFF_ID_FLIGHT3,
  CAR: process.env.NEXT_PUBLIC_AFF_ID_CAR,
  CAR2: process.env.NEXT_PUBLIC_AFF_ID_CAR2,
  CAR3: process.env.NEXT_PUBLIC_AFF_ID_CAR3,
  CAR4: process.env.NEXT_PUBLIC_AFF_ID_CAR4,
  CAR5: process.env.NEXT_PUBLIC_AFF_ID_CAR5,
  FIN1: process.env.NEXT_PUBLIC_AFF_ID_FINANCE1,
  FIN2: process.env.NEXT_PUBLIC_AFF_ID_FINANCE2,
  FIN3: process.env.NEXT_PUBLIC_AFF_ID_FINANCE3,
  TRD1: process.env.NEXT_PUBLIC_AFF_ID_TRADING1,
  TRD2: process.env.NEXT_PUBLIC_AFF_ID_TRADING2,
  TRD3: process.env.NEXT_PUBLIC_AFF_ID_TRADING3,
  TCK1: process.env.NEXT_PUBLIC_AFF_ID_TICKETS1,
  TCK2: process.env.NEXT_PUBLIC_AFF_ID_TICKETS2,
  TCK3: process.env.NEXT_PUBLIC_AFF_ID_TICKETS3,
  SIM1: process.env.NEXT_PUBLIC_AFF_ID_CONNECTIVITY1,
  SIM2: process.env.NEXT_PUBLIC_AFF_ID_CONNECTIVITY2,
  SIM3: process.env.NEXT_PUBLIC_AFF_ID_CONNECTIVITY3,
  INS1: process.env.NEXT_PUBLIC_AFF_ID_INSURANCE1,
  INS2: process.env.NEXT_PUBLIC_AFF_ID_INSURANCE2,
  INS3: process.env.NEXT_PUBLIC_AFF_ID_INSURANCE3,
  VPN1: process.env.NEXT_PUBLIC_AFF_ID_VPN1,
  VPN2: process.env.NEXT_PUBLIC_AFF_ID_VPN2,
  VPN3: process.env.NEXT_PUBLIC_AFF_ID_VPN3,
  SW: process.env.NEXT_PUBLIC_AFF_ID_SOFTWARE,
  AMZ: process.env.NEXT_PUBLIC_AFF_ID_AMAZON,
};

// Standard builder fallback (server-only IDs)
const std = {
  amazonTag: process.env.AFF_AZON_TAG,
  booking: process.env.AFF_BOOKING_ID,
  skyscanner: process.env.AFF_SKYSCANNER_PARTNER,
  rentalcars: process.env.AFF_RENTALCARS_ID,
  trainline: process.env.AFF_TRAINLINE_AID,
  ticketmaster: process.env.AFF_TICKETMASTER_ID,
  ebay: process.env.AFF_EBAY_CAMPAIGN_ID,
  decathlon: process.env.AFF_DECATHLON_ID,
  aliexpress: process.env.AFF_ALIEXPRESS_ID,
  etsy: process.env.AFF_ETSY_AFF_ID,
};

function addParams(base: string, params: Record<string, string | undefined>) {
  const url = new URL(base);
  Object.entries(params).forEach(([k, v]) => { if (v && v.trim()) url.searchParams.set(k, v.trim()); });
  return url.toString();
}

function stdBuild(to: AffKey, q?: string) {
  const query = (q || "").trim();
  switch (to) {
    case "amazon":      return addParams("https://www.amazon.it/s", { k: query, tag: std.amazonTag });
    case "booking":     return addParams("https://www.booking.com/index.html", { aid: std.booking, ss: query });
    case "skyscanner":  return addParams("https://www.skyscanner.net/", { partner: std.skyscanner });
    case "rentalcars":  return addParams("https://www.rentalcars.com/", { affiliateCode: std.rentalcars });
    case "trainline":   return addParams("https://www.thetrainline.com/", { ac: std.trainline });
    case "ticketmaster":return addParams("https://www.ticketmaster.it/", { aff: std.ticketmaster });
    case "ebay":        return addParams("https://www.ebay.it/sch/i.html", { _nkw: query });
    case "decathlon":   return "https://www.decathlon.it/";
    case "aliexpress":  return "https://www.aliexpress.com/";
    case "etsy":        return addParams("https://www.etsy.com/search", { q: query });
    default:            return process.env.NEXT_PUBLIC_BASE_URL || "https://vrabo.it/";
  }
}

export function resolveAffiliateUrl(key: AffKey, q?: string): string {
  // Prefer direct NEXT_PUBLIC_* URLs
  switch (key) {
    case "trip_hotels":   return pub.HOTEL || stdBuild("booking", q);
    case "trip_flights":  return pub.FLIGHT || pub.FLIGHT2 || pub.FLIGHT3 || stdBuild("skyscanner", q);
    case "trip_cars":     return pub.CAR || pub.CAR2 || pub.CAR3 || pub.CAR4 || pub.CAR5 || stdBuild("rentalcars", q);
    case "localrent":     return pub.CAR2 || stdBuild("rentalcars", q);
    case "gyg":           return pub.TCK1 || "https://www.getyourguide.com/";
    case "tiqets":        return pub.TCK2 || "https://www.tiqets.com/";
    case "ticketnetwork": return pub.TCK3 || "https://www.ticketnetwork.com/";
    case "yesim":         return pub.SIM1 || "https://www.yesim.app/";
    case "airalo":        return pub.SIM2 || "https://www.airalo.com/";
    case "drimsim":       return pub.SIM3 || "https://drimsim.com/";
    case "compensair":    return pub.INS1 || "https://www.compensair.com/";
    case "binance_cpa":   return pub.TRD1 || "https://www.binance.com/";
    case "amazon":        return pub.AMZ || stdBuild("amazon", q);
    // Fallbacks to standard brand builders
    case "booking":
    case "skyscanner":
    case "rentalcars":
    case "trainline":
    case "ticketmaster":
    case "ebay":
    case "decathlon":
    case "aliexpress":
    case "etsy":
      return stdBuild(key, q);
    default:
      return process.env.NEXT_PUBLIC_BASE_URL || "https://vrabo.it/";
  }
}
