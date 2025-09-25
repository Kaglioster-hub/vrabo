export type FlightProvider = {
  key: string; name: string; site: string; logo?: string; desc?: string;
  referralParam?: string; searchTemplate?: string; affiliateEnv?: string;
};
export const FLIGHT_PROVIDERS: FlightProvider[] = [
  { key:"SKYSCANNER", name:"Skyscanner", site:"https://www.skyscanner.net/",
    desc:"aggregatore globale",
    searchTemplate:"https://www.skyscanner.net/transport/flights/{from}/{to}/{depart}/{return}/?adultsv2={adults}&ref={aff}",
    affiliateEnv:"NEXT_PUBLIC_AFF_SKYSCANNER", referralParam:"ref" },
  { key:"KIWI", name:"Kiwi.com", site:"https://www.kiwi.com/",
    desc:"ricerca flessibile",
    searchTemplate:"https://www.kiwi.com/en/search/results/{from}-{to}/{depart}/{return}?adults={adults}&affilid={aff}",
    affiliateEnv:"NEXT_PUBLIC_AFF_KIWI" },
  { key:"KAYAK", name:"KAYAK", site:"https://www.kayak.com/",
    desc:"comparatore",
    searchTemplate:"https://www.kayak.com/flights/{from}-{to}/{depart}/{return}?adults={adults}&cp_a={aff}",
    affiliateEnv:"NEXT_PUBLIC_AFF_KAYAK" },
  { key:"MOMONDO", name:"momondo", site:"https://www.momondo.com/",
    desc:"prezzi storici",
    searchTemplate:"https://www.momondo.com/flight-search/{from}-{to}/{depart}/{return}?adults={adults}",
    affiliateEnv:"NEXT_PUBLIC_AFF_MOMONDO" },
  { key:"TRIPCOM_FLIGHTS", name:"Trip.com", site:"https://www.trip.com/",
    desc:"voli + hotel",
    searchTemplate:"https://us.trip.com/flights/{from}-{to}/?depdate={depart}&retdate={return}&adult={adults}&allianceid={aff}",
    affiliateEnv:"NEXT_PUBLIC_AFF_TRIPCOM_FLIGHTS" },
  { key:"EXPEDIA_FLIGHTS", name:"Expedia", site:"https://www.expedia.com/",
    desc:"compagnie tradizionali",
    // complesso: se mancano parametri, fallback al sito
    searchTemplate:"https://www.expedia.com/Flights-Search?trip=roundtrip&leg1=from:{from},to:{to},departure:{depart}TANYT&leg2=from:{to},to:{from},departure:{return}TANYT&passengers=adults:{adults}&mode=search&affcid={aff}",
    affiliateEnv:"NEXT_PUBLIC_AFF_EXPEDIA_FLIGHTS" }
];
