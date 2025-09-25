export type HotelParams = { q?: string; checkin?: string; checkout?: string; adults?: number; };
export type FlightParams = { from: string; to: string; depart: string; ret?: string; oneWay?: boolean; adults?: number; };

export const affiliates = {
  // ---- HOTEL / ALLOGGI ----
  booking: { buildUrl: ({ q, checkin, checkout, adults }: HotelParams) =>
    `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(q||"")}`
    + (checkin?`&checkin=${checkin}`:"") + (checkout?`&checkout=${checkout}`:"") + (adults?`&group_adults=${adults}`:"")
  },
  tripcom: {
    buildHotel: ({ q, checkin, checkout, adults }: HotelParams) =>
      `https://www.trip.com/hotels?search=${encodeURIComponent(q||"")}`
      + (checkin?`&checkin=${checkin}`:"") + (checkout?`&checkout=${checkout}`:"") + (adults?`&adult=${adults}`:""),
    buildFlight: ({ from, to, depart, ret, oneWay, adults }: FlightParams) => {
      const p = new URLSearchParams();
      p.set("flighttype", oneWay ? "ow" : "rt");
      p.set("dcity", (from||"").toUpperCase());
      p.set("acity", (to||"").toUpperCase());
      p.set("date", depart);
      if (!oneWay && ret) p.set("returndate", ret);
      p.set("adult", String(adults ?? 1));
      return `https://www.trip.com/flights/search?${p.toString()}`;
    }
  },
  agoda:   { buildUrl: ({ q }: HotelParams) => `https://www.agoda.com/search?city=${encodeURIComponent(q||"")}` },
  expedia: { buildUrl: ({ q }: HotelParams) => `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(q||"")}` },
  airbnb:  { buildUrl: ({ q }: HotelParams) => `https://www.airbnb.com/s/${encodeURIComponent(q||"")}/homes` },
  stay22:  { buildUrl: ({ q }: HotelParams) => `https://www.stay22.com/${encodeURIComponent(q||"")}` },

  // ---- META VOLI ----
  skyscanner: { buildFlight: ({ from, to, depart, ret, oneWay }: FlightParams) =>
    `https://www.skyscanner.net/transport/flights/${(from||"").toUpperCase()}/${(to||"").toUpperCase()}/${depart}${oneWay?"":`/${ret}`}`
  },

  // ---- SERVIZI / REFERRAL ---- (chiavi piatte)
  binance:      { url: process.env.BINANCE_REF       ? `https://accounts.binance.com/it/register?ref=${process.env.BINANCE_REF}` : "https://www.binance.com" },
  kucoin:       { url: process.env.KUCOIN_REF        ? `https://www.kucoin.com/r/${process.env.KUCOIN_REF}` : "https://www.kucoin.com" },
  bybit:        { url: process.env.BYBIT_URL         || "https://www.bybit.com" },
  okx:          { url: process.env.OKX_URL           || "https://www.okx.com" },
  etoro:        { url: process.env.ETORO_URL         || "https://www.etoro.com/" },
  revolut:      { url: process.env.REVOLUT_URL       || "https://www.revolut.com/" },
  wise:         { url: process.env.WISE_URL          || "https://wise.com/" },
  n26:          { url: process.env.N26_URL           || "https://n26.com/" },
  vodafoneEsim: { url: process.env.VODAFONE_ESIM_URL || "https://www.vodafone.it/" },
  airalo:       { url: process.env.AIRALO_URL        || "https://www.airalo.com/" },
  travelIns:    { url: process.env.TRAVEL_INS_URL    || "#" },
} as const;
