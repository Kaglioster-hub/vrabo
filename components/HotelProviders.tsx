"use client";
import { type Deal } from "@/config/deals";
import { bestLogoFor, fallbackLogo } from "@/utils/logo";
type Provider = { key:string; name:string; site:string; desc?:string; logo?:string };
const HOTELS: Provider[] = [
  { key:"BOOKING", name:"Booking.com", site:"https://www.booking.com/", desc:"copertura globale" },
  { key:"EXPEDIA", name:"Expedia",     site:"https://www.expedia.com/", desc:"hotel & pacchetti" },
  { key:"TRIP",    name:"Trip.com",    site:"https://us.trip.com/",     desc:"offerte dinamiche" },
  { key:"HOTELSCOMBINED", name:"HotelsCombined", site:"https://www.hotelscombined.com/", desc:"compara prezzi" },
  { key:"HOSTELWORLD", name:"Hostelworld", site:"https://www.hostelworld.com/", desc:"ostelli nel mondo" },
];
function Pill({href,children}:{href:string;children:React.ReactNode}) {
  return <a className="inline-flex items-center rounded-xl border border-white/10 px-3 py-1 text-sm hover:bg-white/10"
           href={href} target="_blank" rel="nofollow">{children}</a>;
}
export default function HotelProviders({ city, checkin, checkout, adults=2, deals }:{
  city?: string; checkin?: string; checkout?: string; adults?: number; deals: Record<string, Deal>;
}) {
  const ready = !!(city && checkin && checkout);
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {HOTELS.map(p=>{
        const d = deals[p.key] || {};
        const src = bestLogoFor(p.site, p.logo);
        const mk = (sort:"cheap"|"rating"|"best") =>
          `/api/out?mode=stay&prov=${p.key}&city=${encodeURIComponent(city||"")}&checkin=${checkin||""}&checkout=${checkout||""}&adults=${adults||1}&sort=${sort}`;
        return (
          <div key={p.key} className="card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img src={src} alt={p.name} className="h-8 w-8 rounded" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src=fallbackLogo(p.site); }}/>
              <div className="font-semibold">{p.name}</div>
            </div>
            {p.desc && <div className="text-sm text-white/70">{p.desc}</div>}
            {(d.code || d.note) && (
              <div className="text-sm">
                {d.code && <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 mr-2">Coupon: <b className="ml-1">{d.code}</b></span>}
                {d.note && <span className="inline-flex items-center px-2 py-1 rounded-lg bg-white/10">{d.note}</span>}
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-1">
              <Pill href={mk("cheap")}>Prezzo</Pill>
              <Pill href={mk("rating")}>Valutazione</Pill>
              <Pill href={mk("best")}>Consigliati</Pill>
            </div>
            {!ready && <div className="text-xs text-white/60">Inserisci destinazione e date.</div>}
          </div>
        );
      })}
    </div>
  );
}
