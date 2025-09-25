export type FlightArgs = {
  from:string; to:string; depart:string; ret?:string; adults?:string; sort?: "cheap"|"best"|"fast";
};
const z=(s?:string)=> encodeURIComponent(s||"");

const kayakSort = (s?:FlightArgs["sort"]) => s==="cheap"?"price_a": s==="fast"?"duration_a":"bestflight_a";
const momondoSort = kayakSort; // stesso gruppo, stessi param nella pratica
const expediaSort = kayakSort;

export function buildFlightLink(prov:string, a:FlightArgs){
  const {from,to,depart,ret,adults="1",sort} = a;
  const rt = ret ? `/${ret}` : "";
  if(prov==="KAYAK"){
    const u = new URL(`https://www.kayak.com/flights/${z(from)}-${z(to)}/${z(depart)}${rt}`);
    u.searchParams.set("adults", adults); u.searchParams.set("sort", kayakSort(sort)); return u.toString();
  }
  if(prov==="MOMONDO"){
    const u = new URL(`https://www.momondo.com/flight-search/${z(from)}-${z(to)}/${z(depart)}${rt}`);
    u.searchParams.set("adults", adults); u.searchParams.set("sort", momondoSort(sort)); return u.toString();
  }
  if(prov==="SKYSCANNER"){
    const p2 = ret ? `/${ret}` : "";
    const u = new URL(`https://www.skyscanner.net/transport/flights/${z(from)}/${z(to)}/${z(depart)}${p2}`);
    u.searchParams.set("adults", adults); return u.toString();
  }
  if(prov==="EXPEDIA"){
    const u = new URL("https://www.expedia.com/Flights-Search");
    u.searchParams.set("trip", ret?"roundtrip":"oneway");
    u.searchParams.set("leg1", `from=${from},to=${to},departure=${depart}TANYT`);
    if(ret) u.searchParams.set("leg2", `from=${to},to=${from},departure=${ret}TANYT`);
    u.searchParams.set("passengers", `adults=${adults}`);
    u.searchParams.set("mode", "search");
    u.searchParams.set("sort", expediaSort(sort));
    return u.toString();
  }
  // fallback: Kayak
  return buildFlightLink("KAYAK", a);
}

export type HotelArgs = { city:string; checkin:string; checkout:string; adults?:string; };
export function buildHotelLink(prov:string, a:HotelArgs){
  const { city, checkin, checkout, adults="2" } = a;
  if(prov==="BOOKING"){
    const u=new URL("https://www.booking.com/searchresults.html");
    u.searchParams.set("ss", city); u.searchParams.set("checkin", checkin); u.searchParams.set("checkout", checkout);
    u.searchParams.set("group_adults", adults); return u.toString();
  }
  if(prov==="EXPEDIA"){
    const u=new URL("https://www.expedia.com/Hotel-Search");
    u.searchParams.set("destination", city); u.searchParams.set("startDate", checkin); u.searchParams.set("endDate", checkout);
    u.searchParams.set("adults", adults); return u.toString();
  }
  if(prov==="HOTELSCOMBINED"){
    const u=new URL("https://www.hotelscombined.com/Search");
    u.searchParams.set("destination", city); u.searchParams.set("checkin", checkin); u.searchParams.set("checkout", checkout);
    u.searchParams.set("adults", adults); return u.toString();
  }
  if(prov==="HOSTELWORLD"){
    const u=new URL("https://www.hostelworld.com/findabed.php");
    u.searchParams.set("search_keywords", city); u.searchParams.set("date_from", checkin); u.searchParams.set("date_to", checkout); return u.toString();
  }
  return buildHotelLink("BOOKING", a);
}

export type CarArgs = { city:string; pickup:string; dropoff:string; };
export function buildCarLink(prov:string, a:CarArgs){
  const { city, pickup, dropoff } = a;
  if(prov==="RENTALCARS"){ const u=new URL("https://www.rentalcars.com/Home.do"); u.searchParams.set("fts_search_type","place"); u.searchParams.set("fts_type","A"); u.searchParams.set("fts_searchLocationVal", city); u.searchParams.set("pickup", pickup); u.searchParams.set("dropoff", dropoff); return u.toString(); }
  if(prov==="DISCOVERCARS"){ const u=new URL("https://www.discovercars.com/search"); u.searchParams.set("pickup", city); u.searchParams.set("from", pickup); u.searchParams.set("to", dropoff); return u.toString(); }
  if(prov==="QEEQ"){ const u=new URL("https://www.qeeq.com/car-rental"); u.searchParams.set("pickup", city); u.searchParams.set("from", pickup); u.searchParams.set("to", dropoff); return u.toString(); }
  if(prov==="ECONOMYBOOKINGS"){ const u=new URL("https://www.economybookings.com/"); u.searchParams.set("loc", city); u.searchParams.set("from", pickup); u.searchParams.set("to", dropoff); return u.toString(); }
  if(prov==="AUTOEUROPE"){ const u=new URL("https://www.autoeurope.eu/"); u.searchParams.set("pickup", city); u.searchParams.set("from", pickup); u.searchParams.set("to", dropoff); return u.toString(); }
  return buildCarLink("RENTALCARS", a);
}
