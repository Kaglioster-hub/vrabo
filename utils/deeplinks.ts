export type FlightArgs = {
  from: string; to: string; depart: string; ret?: string;
  adults?: string; sort?: "cheap"|"best"|"fast";
};
export type StayArgs = {
  city: string; checkin: string; checkout: string;
  adults?: string; sort?: "cheap"|"best"|"rating";
};
export type CarArgs = {
  city: string; pickup: string; dropoff: string;
  sort?: "cheap"|"best"|"supplier";
};

const yymmdd = (iso:string)=>{ const [Y,M,D]=iso.split("-"); return `${Y.slice(-2)}${M}${D}`; };

const mapFlightSort = (prov:string, s?:FlightArgs["sort"])=>{
  const sort = s||"best";
  switch(prov){
    case "KAYAK":      return sort==="cheap"?"price_a"     : sort==="fast"?"duration_a" : "bestflight_a";
    case "MOMONDO":    return sort==="cheap"?"price_a"     : sort==="fast"?"duration_a" : "quality_a";
    case "SKYSCANNER": return sort==="cheap"?"price_asc"   : sort==="fast"?"duration_asc": "best";
    case "EXPEDIA":    return sort==="cheap"?"PRICE_LOW_TO_HIGH" : sort==="fast"?"DURATION_SHORTEST" : "BEST";
    default: return undefined;
  }
};

const mapStaySort = (prov:string, s?:StayArgs["sort"])=>{
  const sort = s||"cheap";
  switch(prov){
    case "BOOKING":  return sort==="cheap"?"price" : sort==="rating"?"review_score_and_price" : "bayesian_review_score";
    case "EXPEDIA":  return sort==="cheap"?"PRICE_LOW_TO_HIGH" : sort==="rating"?"GUEST_RATING" : "RECOMMENDED";
    case "TRIP":     return sort==="cheap"?"price" : sort==="rating"?"rating" : "recommended";
    case "HOTELSCOMBINED": return sort==="cheap"?"price" : sort==="rating"?"guest-rating" : "recommended";
    case "HOSTELWORLD": return sort==="cheap"?"price" : sort==="rating"?"rating" : "recommended";
    default: return undefined;
  }
};

const mapCarSort = (prov:string, s?:CarArgs["sort"])=>{
  const sort = s||"cheap";
  switch(prov){
    case "RENTALCARS":     return sort==="cheap"?"price" : sort==="supplier"?"supplier" : "recommended";
    case "DISCOVERCARS":   return sort==="cheap"?"price" : sort==="supplier"?"supplier" : "recommended";
    case "QEEQ":           return sort==="cheap"?"price" : sort==="supplier"?"supplier" : "recommended";
    case "ECONOMYBOOKINGS":return sort==="cheap"?"price" : sort==="supplier"?"supplier" : "recommended";
    case "AUTOEUROPE":     return sort==="cheap"?"price" : sort==="supplier"?"supplier" : "recommended";
    default: return undefined;
  }
};

export function buildFlightLink(prov:string, a:FlightArgs){
  const from=a.from?.toUpperCase(); const to=a.to?.toUpperCase(); const ad=a.adults||"1";
  const sort = mapFlightSort(prov, a.sort);
  if (prov==="KAYAK"){
    const base=`https://www.kayak.com/flights/${from}-${to}/${a.depart}${a.ret?`/${a.ret}`:""}/${ad}`;
    const u=new URL(base); if(sort) u.searchParams.set("sort",sort); return u.toString();
  }
  if (prov==="MOMONDO"){
    const base=`https://www.momondo.com/flight-search/${from}-${to}/${a.depart}${a.ret?`/${a.ret}`:""}/${ad}adults`;
    const u=new URL(base); if(sort) u.searchParams.set("sort",sort); return u.toString();
  }
  if (prov==="SKYSCANNER"){
    const d=yymmdd(a.depart); const r=a.ret?yymmdd(a.ret):"";
    const base=`https://www.skyscanner.net/transport/flights/${from}/${to}/${d}${r?`/${r}`:""}/?adults=${ad}`;
    const u=new URL(base); if(sort) u.searchParams.set("sort",sort); return u.toString();
  }
  if (prov==="EXPEDIA"){
    const u=new URL("https://www.expedia.com/Flights-Search");
    u.searchParams.set("trip", a.ret?"roundtrip":"oneway");
    u.searchParams.set("leg1", `from:${from},to:${to},departure:${a.depart}TANYT`);
    if(a.ret) u.searchParams.set("leg2", `from:${to},to:${from},departure:${a.ret}TANYT`);
    u.searchParams.set("passengers", `adults:${ad}`);
    if(sort) u.searchParams.set("sort", sort);
    return u.toString();
  }
  return ""; // altri (Kiwi/Trip) disabilitati finché non stabili
}

export function buildHotelLink(prov:string, a:StayArgs){
  const ad=a.adults||"2"; const sort = mapStaySort(prov, a.sort);
  if (prov==="BOOKING"){
    const u=new URL("https://www.booking.com/searchresults.html");
    u.searchParams.set("ss", a.city);
    u.searchParams.set("checkin", a.checkin);
    u.searchParams.set("checkout", a.checkout);
    u.searchParams.set("group_adults", ad);
    if(sort) u.searchParams.set("order", sort);
    return u.toString();
  }
  if (prov==="EXPEDIA"){
    const u=new URL("https://www.expedia.com/Hotel-Search");
    u.searchParams.set("destination", a.city);
    u.searchParams.set("checkin", a.checkin);
    u.searchParams.set("checkout", a.checkout);
    u.searchParams.set("adults", ad);
    if(sort) u.searchParams.set("sort", sort);
    return u.toString();
  }
  if (prov==="TRIP"){
    const u=new URL("https://us.trip.com/hotels/list");
    u.searchParams.set("city", a.city);
    u.searchParams.set("checkin", a.checkin);
    u.searchParams.set("checkout", a.checkout);
    u.searchParams.set("adult", ad);
    if(sort) u.searchParams.set("sort", sort);
    return u.toString();
  }
  if (prov==="HOTELSCOMBINED"){
    const u=new URL("https://www.hotelscombined.com/Place/Search");
    u.searchParams.set("destination", a.city);
    u.searchParams.set("checkin", a.checkin);
    u.searchParams.set("checkout", a.checkout);
    if(sort) u.searchParams.set("sort", sort);
    return u.toString();
  }
  if (prov==="HOSTELWORLD"){
    const u=new URL("https://www.hostelworld.com/findabed.php");
    u.searchParams.set("city", a.city);
    u.searchParams.set("dateFrom", a.checkin);
    u.searchParams.set("dateTo", a.checkout);
    if(sort) u.searchParams.set("sort", sort);
    return u.toString();
  }
  return "";
}

export function buildCarLink(prov:string, a:CarArgs){
  const sort = mapCarSort(prov, a.sort);
  if (prov==="RENTALCARS"){
    const u=new URL("https://www.rentalcars.com/Home.do");
    u.searchParams.set("fts_search_type","place");
    u.searchParams.set("fts_type","A");
    u.searchParams.set("fts_searchLocationVal", a.city);
    u.searchParams.set("pickup", a.pickup);
    u.searchParams.set("dropoff", a.dropoff);
    if(sort) u.searchParams.set("sort", sort);
    return u.toString();
  }
  if (prov==="DISCOVERCARS"){
    const u=new URL("https://www.discovercars.com/search");
    u.searchParams.set("pickup", a.city);
    u.searchParams.set("from", a.pickup);
    u.searchParams.set("to", a.dropoff);
    if(sort) u.searchParams.set("sort", sort);
    return u.toString();
  }
  if (prov==="QEEQ"){
    const u=new URL("https://www.qeeq.com/car-rental");
    u.searchParams.set("pickup", a.city);
    u.searchParams.set("from", a.pickup);
    u.searchParams.set("to", a.dropoff);
    if(sort) u.searchParams.set("sort", sort);
    return u.toString();
  }
  if (prov==="ECONOMYBOOKINGS"){
    const u=new URL("https://www.economybookings.com/");
    u.searchParams.set("loc", a.city);
    u.searchParams.set("from", a.pickup);
    u.searchParams.set("to", a.dropoff);
    if(sort) u.searchParams.set("sort", sort);
    return u.toString();
  }
  if (prov==="AUTOEUROPE"){
    const u=new URL("https://www.autoeurope.eu/");
    u.searchParams.set("pickup", a.city);
    u.searchParams.set("from", a.pickup);
    u.searchParams.set("to", a.dropoff);
    if(sort) u.searchParams.set("sort", sort);
    return u.toString();
  }
  return "";
}
