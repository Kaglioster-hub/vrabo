export type CarProvider = {
  key: string; name: string; site: string; logo?: string; desc?: string;
  referralParam?: string; extraParams?: Record<string,string>;
  searchTemplate?: string; // {city},{pickup},{dropoff},{aff}
  affiliateEnv?: string;
};
export const CAR_PROVIDERS: CarProvider[] = [
  { key:"RENTALCARS", name:"Rentalcars", site:"https://www.rentalcars.com/",
    desc:"confronta le principali compagnie",
    searchTemplate:"https://www.rentalcars.com/Home.do?fts_search_type=place&fts_type=A&fts_searchLocationVal={city}&pickup={pickup}&dropoff={dropoff}&affiliateCode={aff}",
    affiliateEnv:"RENTALCARS_AFFILIATE_CODE" },
  { key:"DISCOVERCARS", name:"DiscoverCars", site:"https://www.discovercars.com/",
    desc:"offerte globali",
    searchTemplate:"https://www.discovercars.com/search?pickup={city}&from={pickup}&to={dropoff}&a={aff}",
    affiliateEnv:"NEXT_PUBLIC_AFF_DISCOVERCARS", referralParam:"a" },
  { key:"QEEQ", name:"QEEQ", site:"https://www.qeeq.com/",
    desc:"prezzi competitivi",
    searchTemplate:"https://www.qeeq.com/car-rental?pickup={city}&from={pickup}&to={dropoff}&ref={aff}",
    affiliateEnv:"NEXT_PUBLIC_AFF_QEEQ", referralParam:"ref" },
  { key:"ECONOMYBOOKINGS", name:"EconomyBookings", site:"https://www.economybookings.com/",
    desc:"ampia copertura",
    searchTemplate:"https://www.economybookings.com/?loc={city}&from={pickup}&to={dropoff}&affid={aff}",
    affiliateEnv:"NEXT_PUBLIC_AFF_ECONOMYBOOKINGS" },
  { key:"AUTOEUROPE", name:"AutoEurope", site:"https://www.autoeurope.eu/",
    desc:"servizio clienti top",
    searchTemplate:"https://www.autoeurope.eu/?pickup={city}&from={pickup}&to={dropoff}&ref={aff}",
    affiliateEnv:"NEXT_PUBLIC_AFF_AUTOEUROPE", referralParam:"ref" },

  { key:"SIXT", name:"Sixt", site:"https://www.sixt.com/", desc:"premium fleet", affiliateEnv:"NEXT_PUBLIC_AFF_SIXT" },
  { key:"HERTZ", name:"Hertz", site:"https://www.hertz.com/", desc:"rete mondiale", affiliateEnv:"NEXT_PUBLIC_AFF_HERTZ" },
  { key:"AVIS", name:"Avis", site:"https://www.avis.com/", desc:"offerte weekend", affiliateEnv:"NEXT_PUBLIC_AFF_AVIS" },
  { key:"EUROPCAR", name:"Europcar", site:"https://www.europcar.com/", desc:"diffusa in EU", affiliateEnv:"NEXT_PUBLIC_AFF_EUROPCAR" },
  { key:"BUDGET", name:"Budget", site:"https://www.budget.com/", desc:"tariffe smart", affiliateEnv:"NEXT_PUBLIC_AFF_BUDGET" },
  { key:"ENTERPRISE", name:"Enterprise", site:"https://www.enterprise.com/", desc:"scelta ampia", affiliateEnv:"NEXT_PUBLIC_AFF_ENTERPRISE" }
];
