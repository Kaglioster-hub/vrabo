"use client";
import { type Deal } from "@/config/deals";
import { bestLogoFor, fallbackLogo } from "@/utils/logo";

type Provider = { key:string; name:string; site:string; desc?:string; logo?:string; enabled?:boolean };

const FLIGHTS: Provider[] = [
  { key:"KAYAK",     name:"KAYAK",     site:"https://www.kayak.com/",     desc:"comparatore", enabled:true },
  { key:"MOMONDO",   name:"momondo",   site:"https://www.momondo.com/",   desc:"prezzi storici", enabled:true },
  { key:"SKYSCANNER",name:"Skyscanner",site:"https://www.skyscanner.net/",desc:"aggregatore globale", enabled:true },
  { key:"EXPEDIA",   name:"Expedia",   site:"https://www.expedia.com/",   desc:"compagnie tradizionali", enabled:true },
  // { key:"KIWI",   name:"Kiwi.com",   site:"https://www.kiwi.com/",    desc:"ricerca flessibile", enabled:false },
  // { key:"TRIP",   name:"Trip.com",   site:"https://us.trip.com/",     desc:"voli+hotel", enabled:false },
];

function Pill({href,children}:{href:string;children:React.ReactNode}) {
  return <a className="inline-flex items-center rounded-xl border border-white/10 px-3 py-1 text-sm hover:bg-white/10"
           href={href} target="_blank" rel="nofollow">{children}</a>;
}

export default function FlightProviders({ from, to, depart, ret, adults=1, deals }:{
  from?: string; to?: string; depart?: string; ret?: string; adults?: number; deals: Record<string, Deal>;
}) {
  const ready = !!(from && to && depart);
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {FLIGHTS.filter(p=>p.enabled!==false).map(p=>{
        const d = deals[p.key] || {};
        const src = bestLogoFor(p.site, p.logo);
        const mk = (sort:"cheap"|"best"|"fast") =>
          `/api/out?mode=flight&prov=${p.key}&from=${from||""}&to=${to||""}&depart=${depart||""}&ret=${ret||""}&adults=${adults||1}&sort=${sort}`;
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
              <Pill href={mk("cheap")}>Economico</Pill>
              <Pill href={mk("best")}>Migliore</Pill>
              <Pill href={mk("fast")}>Veloce</Pill>
            </div>
            {!ready && <div className="text-xs text-white/60">Compila tratta e date.</div>}
          </div>
        );
      })}
    </div>
  );
}
