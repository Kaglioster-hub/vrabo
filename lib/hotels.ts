export function buildTripHotelURL(
  { city, checkin, checkout, rooms=1, adults=2, children=0 }:
  { city:string; checkin:string; checkout:string; rooms?:number; adults?:number; children?:number }
){
  const base = (process.env.NEXT_PUBLIC_AFF_ID_HOTEL || "https://www.trip.com/");
  const qs = new URLSearchParams({
    searchCity: city, checkIn: checkin, checkOut: checkout,
    rooms: String(rooms), adults: String(adults), children: String(children),
    locale:"it-IT"
  }).toString();
  return `${base}${base.includes("?") ? "&" : "?"}${qs}`;
}
