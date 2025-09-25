"use client";
import { CAR_PROVIDERS, type CarProvider } from "@/utils/carAffiliates";
import { carLink } from "@/utils/carAffiliates";
import { type Deal } from "@/config/deals";
import { bestLogoFor, fallbackLogo } from "@/utils/logo";

function Pill({href,children}:{href:string;children:React.ReactNode}) {
  return <a className="inline-flex items-center rounded-xl border border-white/10 px-3 py-1 text-sm hover:bg-white/10"
           href={href} target="_blank" rel="nofollow">{children}</a>;
}

export default function CarProviders({ city, pickup, dropoff, deals }:{
  city?: string; pickup?: string; dropoff?: string; deals: Record<string, Deal>;
}) {
  const ready = !!(city && pickup && dropoff);
  return (
    <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {CAR_PROVIDERS.map(p=>{
        const d = deals[p.key] || {};
        const src = bestLogoFor(p.site, p.logo);
        const mk = (sort:"cheap"|"best"|"supplier") =>
          `/api/out?mode=car&prov=${p.key}&city=${encodeURIComponent(city||"")}&pickup=${pickup||""}&dropoff=${dropoff||""}&sort=${sort}`;
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
              <Pill href={mk("best")}>Consigliati</Pill>
              <Pill href={mk("supplier")}>Fornitore</Pill>
            </div>
            {!ready && <div className="text-xs text-white/60">Seleziona luogo e date.</div>}
          </div>
        );
      })}
    </div>
  );
}
