const enc = encodeURIComponent;

type Trip = { from:string; to:string; depart:string; ret?:string; adults?:string };
type Stay = { city:string; checkin:string; checkout:string; adults?:string };
type Car  = { city:string; pickup:string; dropoff:string };

function iso(d:string){ return d?.slice(0,10); } // YYYY-MM-DD

export function buildFlightLink(prov:string, t:Trip){
  const P = prov.toUpperCase();
  const A = t.adults || "1";
  if(P==="KAYAK"){
    // es: https://www.kayak.com/flights/FCO-LAX/2025-09-27/2025-10-04/1adults
    const path = `${t.from}-${t.to}/${iso(t.depart)}${t.ret?"/"+iso(t.ret):""}/${A}adults`;
    return `https://www.kayak.com/flights/${path}`;
  }
  if(P==="MOMONDO"){
    // es: https://www.momondo.com/flight-search/FCO-LAX/2025-09-27/2025-10-04?adults=1
    const path = `${t.from}-${t.to}/${iso(t.depart)}${t.ret?"/"+iso(t.ret):""}`;
    return `https://www.momondo.com/flight-search/${path}?adults=${A}`;
  }
  if(P==="SKYSCANNER"){
    // es: https://www.skyscanner.net/transport/flights/FCO/LAX/250927/251004/?adults=1
    const dd = iso(t.depart)?.replaceAll("-","").slice(2);
    const rr = t.ret ? iso(t.ret)?.replaceAll("-","").slice(2) : "";
    return `https://www.skyscanner.net/transport/flights/${t.from}/${t.to}/${dd}/${rr}/?adults=${A}`;
  }
  if(P==="TRIP"){
    // Trip.com (accetta query string, la pagina 404 se manca qualche param → questi sono ok)
    return `https://us.trip.com/flights/search?dep=${enc(t.from)}&arr=${enc(t.to)}&depDate=${iso(t.depart)}${t.ret?`&retDate=${iso(t.ret)}`:""}&adult=${A}`;
  }
  if(P==="EXPEDIA"){
    // rotta roundtrip con leg1/leg2
    const dd = iso(t.depart); const rr = iso(t.ret||t.depart);
    return `https://www.expedia.com/Flights-Search?trip=roundtrip&leg1=from%3A${enc(t.from)}%2Cto%3A${enc(t.to)}%2Cdeparture%3A${dd}TANYT&leg2=from%3A${enc(t.to)}%2Cto%3A${enc(t.from)}%2Cdeparture%3A${rr}TANYT&passengers=adults%3A${A}`;
  }
  // default: Kayak
  return buildFlightLink("KAYAK", t);
}

export function buildHotelLink(prov:string, s:Stay){
  const P = prov.toUpperCase();
  const a = s.adults || "2";
  if(P==="BOOKING"){
    return `https://www.booking.com/searchresults.html?ss=${enc(s.city)}&checkin=${iso(s.checkin)}&checkout=${iso(s.checkout)}&group_adults=${a}`;
  }
  if(P==="EXPEDIA"){
    return `https://www.expedia.com/Hotel-Search?destination=${enc(s.city)}&startDate=${iso(s.checkin)}&endDate=${iso(s.checkout)}&adults=${a}`;
  }
  if(P==="TRIP"){
    return `https://us.trip.com/hotels/list?city=${enc(s.city)}&checkin=${iso(s.checkin)}&checkout=${iso(s.checkout)}&adult=${a}`;
  }
  if(P==="HOTELSCOMBINED"){
    return `https://www.hotelscombined.com/Place/${enc(s.city)}.htm?checkin=${iso(s.checkin)}&checkout=${iso(s.checkout)}&adults=${a}`;
  }
  if(P==="HOSTELWORLD"){
    return `https://www.hostelworld.com/findabed.php/ChosenCity.${enc(s.city)}/checkin.${iso(s.checkin)}/checkout.${iso(s.checkout)}/guests.${a}`;
  }
  return buildHotelLink("BOOKING", s);
}

export function buildCarLink(prov:string, c:Car){
  const P = prov.toUpperCase();
  if(P==="RENTALCARS"){
    return `https://www.rentalcars.com/Home.do?fts_search_type=place&fts_type=A&fts_searchLocationVal=${enc(c.city)}&pickup=${iso(c.pickup)}&dropoff=${iso(c.dropoff)}`;
  }
  if(P==="DISCOVERCARS"){
    return `https://www.discovercars.com/search?pickup=${enc(c.city)}&from=${iso(c.pickup)}&to=${iso(c.dropoff)}`;
  }
  if(P==="QEEQ"){
    return `https://www.qeeq.com/car-rental?pickup=${enc(c.city)}&from=${iso(c.pickup)}&to=${iso(c.dropoff)}`;
  }
  if(P==="ECONOMYBOOKINGS"){
    return `https://www.economybookings.com/?loc=${enc(c.city)}&from=${iso(c.pickup)}&to=${iso(c.dropoff)}`;
  }
  if(P==="AUTOEUROPE"){
    return `https://www.autoeurope.eu/?pickup=${enc(c.city)}&from=${iso(c.pickup)}&to=${iso(c.dropoff)}`;
  }
  return buildCarLink("RENTALCARS", c);
}
