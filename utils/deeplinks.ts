import { ymd, yymmdd } from "@/utils/str";

export type FlightQ = { from:string; to:string; depart:string; ret?:string; adults?:string };
export type HotelQ  = { city:string; checkin:string; checkout:string; adults?:string };
export type CarQ    = { city:string; pickup:string; dropoff:string };

const A = (x?:string, d="1") => x && x.trim() ? x.trim() : d;

export function buildFlightLink(prov:string, q:FlightQ): string {
  const FROM = q.from.toUpperCase(), TO = q.to.toUpperCase();
  const AD  = A(q.adults,"1");
  const D1  = ymd(q.depart);
  const D2  = q.ret ? ymd(q.ret) : "";
  switch (prov.toUpperCase()) {
    case "KAYAK":
      // https://www.kayak.com/flights/FCO-LAX/2025-09-27/2025-10-04?adults=1
      return `https://www.kayak.com/flights/${FROM}-${TO}/${D1}${D2?"/"+D2:""}?adults=${AD}`;
    case "MOMONDO":
      // https://www.momondo.com/flight-search/FCO-LAX/2025-09-27/2025-10-04?adults=1
      return `https://www.momondo.com/flight-search/${FROM}-${TO}/${D1}${D2?"/"+D2:""}?adults=${AD}`;
    case "SKYSCANNER":
      // https://www.skyscanner.com/transport/flights/fco/lax/250927/251004/?adults=1
      const s1 = yymmdd(D1); const s2 = D2 ? yymmdd(D2) : "";
      return `https://www.skyscanner.com/transport/flights/${FROM}/${TO}/${s1}${s2?"/"+s2:""}/?adults=${AD}`;
    case "KIWI":
      // https://www.kiwi.com/en/search/results/FCO/LAX/2025-09-27/2025-10-04?adults=1
      return `https://www.kiwi.com/en/search/results/${FROM}/${TO}/${D1}${D2?"/"+D2:""}?adults=${AD}`;
    case "TRIP":
      // https://us.trip.com/flights/search?dep=FCO&arr=LAX&depDate=2025-09-27&retDate=2025-10-04&adult=1
      return `https://us.trip.com/flights/search?dep=${FROM}&arr=${TO}&depDate=${D1}${D2?`&retDate=${D2}`:""}&adult=${AD}`;
    case "EXPEDIA":
      // Expedia query completa (roundtrip/oneway) — mantiene ricerca
      if (D2) {
        return `https://www.expedia.com/Flights-Search?trip=roundtrip&leg1=from:${FROM},to:${TO},departure:${D1}TANYT&leg2=from:${TO},to:${FROM},departure:${D2}TANYT&passengers=adults:${AD}&mode=search`;
      } else {
        return `https://www.expedia.com/Flights-Search?trip=oneway&leg1=from:${FROM},to:${TO},departure:${D1}TANYT&passengers=adults:${AD}&mode=search`;
      }
    default:
      // fallback Kayak (robusto)
      return `https://www.kayak.com/flights/${FROM}-${TO}/${D1}${D2?"/"+D2:""}?adults=${AD}`;
  }
}

export function buildHotelLink(prov:string, q:HotelQ): string {
  const CITY = encodeURIComponent(q.city.trim());
  const AD   = A(q.adults,"2");
  const CI   = ymd(q.checkin);
  const CO   = ymd(q.checkout);
  switch (prov.toUpperCase()) {
    case "BOOKING":
      return `https://www.booking.com/searchresults.html?ss=${CITY}&checkin=${CI}&checkout=${CO}&group_adults=${AD}`;
    case "EXPEDIA":
      return `https://www.expedia.com/Hotel-Search?destination=${CITY}&startDate=${CI}&endDate=${CO}&adults=${AD}`;
    case "TRIP":
      return `https://us.trip.com/hotels/list?city=${CITY}&checkin=${CI}&checkout=${CO}&adult=${AD}`;
    case "HOTELSCOMBINED":
      return `https://www.hotelscombined.com/Place/${CITY}.htm?checkin=${CI}&checkout=${CO}&adults=${AD}`;
    case "HOSTELWORLD":
      return `https://www.hostelworld.com/findabed.php?SearchAllCities=${CITY}&CheckIn=${CI}&CheckOut=${CO}&Guests=${AD}`;
    default:
      return `https://www.booking.com/searchresults.html?ss=${CITY}&checkin=${CI}&checkout=${CO}&group_adults=${AD}`;
  }
}

export function buildCarLink(prov:string, q:CarQ): string {
  const CITY = encodeURIComponent(q.city.trim());
  const P = ymd(q.pickup), R = ymd(q.dropoff);
  switch (prov.toUpperCase()) {
    case "RENTALCARS":
      return `https://www.rentalcars.com/Home.do?fts_search_type=place&fts_type=A&fts_searchLocationVal=${CITY}&pickup=${P}&dropoff=${R}`;
    case "DISCOVERCARS":
      return `https://www.discovercars.com/search?pickup=${CITY}&from=${P}&to=${R}`;
    case "QEEQ":
      return `https://www.qeeq.com/car-rental?pickup=${CITY}&from=${P}&to=${R}`;
    case "ECONOMYBOOKINGS":
      return `https://www.economybookings.com/?loc=${CITY}&from=${P}&to=${R}`;
    case "AUTOEUROPE":
      return `https://www.autoeurope.eu/?pickup=${CITY}&from=${P}&to=${R}`;
    default:
      return `https://www.rentalcars.com/Home.do?fts_search_type=place&fts_type=A&fts_searchLocationVal=${CITY}&pickup=${P}&dropoff=${R}`;
  }
}
