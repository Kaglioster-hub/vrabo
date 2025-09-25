"use client";
import { CAR_PROVIDERS, type CarProvider } from "@/utils/carAffiliates";
import { carLink } from "@/utils/carAffiliates";
import { type Deal } from "@/config/deals";
import { bestLogoFor, fallbackLogo } from "@/utils/logo";

export default function CarProviders({ city, pickup, dropoff, deals }:{
  city?: string; pickup?: string; dropoff?: string; deals: Record<string, Deal>;
}) {
  const ready = !!(city && pickup && dropoff);
  return (
    <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {CAR_PROVIDERS.map(p=>{
        const d = deals[p.key] || {};
        const href = d.url || carLink(p, city, pickup, dropoff);
        const src = bestLogoFor(p.site, p.logo);
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
                {d.note &&  <span className="inline-flex items-center px-2 py-1 rounded-lg bg-white/10">{d.note}</span>}
              </div>
            )}
            {d.expires && <div className="text-xs text-white/60">Scade: {d.expires}</div>}
            <div className="mt-2">
              <a className={"btn " + (ready ? "btn-primary" : "")} href={href} target="_blank" rel="nofollow">
                {ready ? "Cerca auto" : "Vai all'offerta"}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
