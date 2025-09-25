export type HotelProvider = {
  key: string; name: string; site: string; logo?: string; desc?: string;
  referralParam?: string; extraParams?: Record<string,string>;
  searchTemplate?: string;  // {city},{checkin},{checkout},{adults},{aff}
  affiliateEnv?: string;
};
export const HOTEL_PROVIDERS: HotelProvider[] = [
  { key:"BOOKING", name:"Booking.com", site:"https://www.booking.com/",
    desc:"copertura globale",
    searchTemplate:"https://www.booking.com/searchresults.html?ss={city}&checkin={checkin}&checkout={checkout}&group_adults={adults}&aid={aff}",
    affiliateEnv:"NEXT_PUBLIC_AFF_BOOKING" },
  { key:"EXPEDIA_HOTELS", name:"Expedia", site:"https://www.expedia.com/",
    desc:"hotel e pacchetti",
    searchTemplate:"https://www.expedia.com/Hotel-Search?destination={city}&startDate={checkin}&endDate={checkout}&adults={adults}&affcid={aff}",
    affiliateEnv:"NEXT_PUBLIC_AFF_EXPEDIA" },
  { key:"HOTELSCOM", name:"Hotels.com", site:"https://www.hotels.com/",
    desc:"programma rewards",
    searchTemplate:"https://www.hotels.com/search.do?destination={city}&q-check-in={checkin}&q-check-out={checkout}&q-room-0-adults={adults}&affcid={aff}",
    affiliateEnv:"NEXT_PUBLIC_AFF_HOTELSCOM" },
  { key:"AGODA", name:"Agoda", site:"https://www.agoda.com/",
    desc:"forte in Asia",
    searchTemplate:"https://www.agoda.com/search?keyword={city}&checkIn={checkin}&checkOut={checkout}&adults={adults}&cid={aff}",
    affiliateEnv:"NEXT_PUBLIC_AFF_AGODA" },
  { key:"TRIPCOM_HOTELS", name:"Trip.com", site:"https://www.trip.com/",
    desc:"offerte dinamiche",
    searchTemplate:"https://www.trip.com/hotels/list?city={city}&checkin={checkin}&checkout={checkout}&adult={adults}&allianceid={aff}",
    affiliateEnv:"NEXT_PUBLIC_AFF_TRIPCOM" },
  { key:"HOTELSCOMBINED", name:"HotelsCombined", site:"https://www.hotelscombined.com/",
    desc:"compara prezzi",
    searchTemplate:"https://www.hotelscombined.com/Search?destination={city}&checkin={checkin}&checkout={checkout}&Rooms=1&adults_1={adults}&affid={aff}",
    affiliateEnv:"NEXT_PUBLIC_AFF_HOTELSCOMBINED" },
  { key:"HOSTELWORLD", name:"Hostelworld", site:"https://www.hostelworld.com/",
    desc:"ostelli nel mondo",
    // se il provider richiede ID città, fallback su site con UTM/ref
    affiliateEnv:"NEXT_PUBLIC_AFF_HOSTELWORLD" }
];
