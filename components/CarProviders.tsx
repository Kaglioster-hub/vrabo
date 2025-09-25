"use client";
import { CAR_PROVIDERS, type CarProvider } from "@/utils/carAffiliates";
import { carLink } from "@/utils/carAffiliates";
import { type Deal } from "@/config/deals";
import { bestLogoFor, fallbackLogo } from "@/utils/logo";
import { useEffect, useState } from "react";

type Preview = { prices?:{ small:number|null, medium:number|null, large:number|null }|null, currency?:string };

export default function CarProviders({ city, pickup, dropoff, deals }:{
  city?: string; pickup?: string; dropoff?: string; deals: Record<string, Deal>;
}) {
  const ready = !!(city && pickup && dropoff);
  const [prev,setPrev] = useState<Preview|null>(null);
  const [cls,setCls]   = useState<"small"|"medium"|"large">("small");

  useEffect(()=>{
    let alive=true;
    if(ready){
      const q = new URLSearchParams({ city: city!, pickup: pickup!, dropoff: dropoff! });
      fetch(`/api/cars/preview?`+q.toString()).then(r=>r.json()).then(j=>{ if(alive) setPrev(j); }).catch(()=>{});
    } else { setPrev(null); }
    return ()=>{ alive=false; };
  },[city,pickup,dropoff,ready]);

  function deeplink(p: CarProvider){
    // aggiungiamo un hint di classe (non tutti i provider lo supportano: va ignorato se non gestito)
    const url = carLink(p, city, pickup, dropoff);
    const u = new URL(url);
    if (cls==="small")  u.searchParams.set("car_class","small");
    if (cls==="medium") u.searchParams.set("car_class","medium");
    if (cls==="large")  u.searchParams.set("car_class","large");
    return u.toString();
  }

  const PriceBadge = ({v}:{v:number|null|undefined})=>{
    if(v==null) return <span className="inline-flex items-center px-2 py-1 rounded bg-white/10 text-white/60">n/d</span>;
    return <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-500/20 text-emerald-200">da €{v.toFixed(0)}</span>;
  };

  return (
    <div className="mt-3">
      {ready && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm text-white/70">Categoria:</span>
          <div className="inline-flex rounded-lg border border-white/10 overflow-hidden">
            {(["small","medium","large"] as const).map(k=>(
              <button key={k} className={"px-3 py-1 text-sm "+(cls===k?"bg-white/10":"hover:bg-white/5")} onClick={()=>setCls(k)}>
                {k==="small"?"Piccola":k==="medium"?"Media":"Grande"}
              </button>
            ))}
          </div>
          {prev?.prices && <div className="text-sm text-white/60 ml-3">
            <span className="mr-2">Piccola <PriceBadge v={prev?.prices?.small}/></span>
            <span className="mr-2">Media <PriceBadge v={prev?.prices?.medium}/></span>
            <span>Grande <PriceBadge v={prev?.prices?.large}/></span>
          </div>}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CAR_PROVIDERS.map(p=>{
          const d = deals[p.key] || {};
          const href = deeplink(p);
          const src = bestLogoFor(p.site, p.logo);
          return (
            <div key={p.key} className="card p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <a href={href} target="_blank" rel="nofollow">
                  <img src={src} alt={p.name} className="h-8 w-8 rounded" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src=fallbackLogo(p.site); }} />
                </a>
                <div className="font-semibold">{p.name}</div>
              </div>
              {p.desc && <div className="text-sm text-white/70">{p.desc}</div>}

              {!ready && <div className="text-sm text-white/50">Seleziona luogo e date.</div>}
              {ready && (
                <div className="flex flex-wrap gap-2">
                  {/* Botte “Prezzo / Consigliati / Fornitore” erano informative; ora mostriamo direttamente la CTA in base alla classe scelta */}
                  <a className="btn btn-primary" href={href} target="_blank" rel="nofollow">
                    Cerca auto {cls==="small"?"(piccola)":cls==="medium"?"(media)":"(grande)"}
                  </a>
                </div>
              )}

              {(d.code || d.note) && (
                <div className="text-xs">
                  {d.code && <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 mr-2">Coupon: <b className="ml-1">{d.code}</b></span>}
                  {d.note &&  <span className="inline-flex items-center px-2 py-1 rounded-lg bg-white/10">{d.note}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
