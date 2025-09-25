"use client";
import { type Deal } from "@/config/deals";
import { bestLogoFor, fallbackLogo } from "@/utils/logo";

type Provider = { key:string; name:string; site:string; desc?:string; logo?:string };

const HOTELS: Provider[] = [
  { key:"BOOKING", name:"Booking.com", site:"https://www.booking.com/", desc:"copertura globale" },
  { key:"EXPEDIA", name:"Expedia",     site:"https://www.expedia.com/",   desc:"hotel e pacchetti" },
  { key:"TRIP",    name:"Trip.com",    site:"https://us.trip.com/",       desc:"offerte dinamiche" },
  { key:"HOTELSCOMBINED", name:"HotelsCombined", site:"https://www.hotelscombined.com/", desc:"compara prezzi" },
  { key:"HOSTELWORLD",    name:"Hostelworld",    site:"https://www.hostelworld.com/",    desc:"ostelli nel mondo" },
];

export default function HotelProviders({ city, checkin, checkout, adults=1, deals }:{
  city?: string; checkin?: string; checkout?: string; adults?: number; deals: Record<string, any>;
}) {
  const ready = !!(city && checkin && checkout);
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {HOTELS.map(p=>{
        const src = bestLogoFor(p.site, p.logo);
        const href = `/api/out?mode=stay&prov=${p.key}&city=${encodeURIComponent(city||"")}&checkin=${checkin||""}&checkout=${checkout||""}&adults=${adults||1}`;
        return (
          <div key={p.key} className="card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img src={src} alt={p.name} className="h-8 w-8 rounded" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = fallbackLogo(p.site); }}/>
              <div className="font-semibold">{p.name}</div>
            </div>
            {p.desc && <div className="text-sm text-white/70">{p.desc}</div>}
            <div className="mt-2">
              <a className={"btn "+(ready?"btn-primary":"")} href={href} onClick={(e)=>{ if(!ready) e.preventDefault(); }}>
                {ready ? "Cerca hotel" : "Inserisci destinazione e date"}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
