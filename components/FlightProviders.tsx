"use client";

import { useEffect, useState } from "react";
import { FLIGHT_PROVIDERS } from "@/utils/flightAffiliates";
import { bestLogoFor, fallbackLogo } from "@/utils/logo";

type PreviewItem = { price: number|null; currency: string; duration: number; stops: number; summary: string; deepLink: string; score: number; };
type MapResults = Record<string, PreviewItem[]>;

export default function FlightProviders({
  from, to, depart, ret, adults=1, deals
}:{
  from?: string; to?: string; depart?: string; ret?: string; adults?: number;
  deals: Record<string, any>;
}) {
  const ready = !!(from && to && depart);
  const [data,setData] = useState<MapResults>({});
  const [loading,setLoading] = useState(false);

  useEffect(()=>{
    let alive=true; setData({});
    if(!ready) return;
    setLoading(true);
    const qs = new URLSearchParams({ from:from!, to:to!, depart:depart!, ret:ret||"", adults:String(adults||1), prov:"ALL" });
    fetch("/api/flights/preview?"+qs.toString())
      .then(r=>r.json())
      .then(j=>{ if(alive) setData(j?.results||{}); })
      .catch(()=>{})
      .finally(()=>{ if(alive) setLoading(false); });
    return ()=>{ alive=false; };
  },[from,to,depart,ret,adults,ready]);

  const Row = ({r}:{r:PreviewItem})=>{
    const price = r.price!=null ? `€${Math.round(r.price)}` : "n/d";
    return (
      <a href={r.deepLink} target="_blank" rel="nofollow"
         className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
         aria-label={`Apri offerta: ${r.summary}, ${price}`}>
        <div className="text-sm">{r.summary}</div>
        <div className="font-semibold">{price}</div>
      </a>
    );
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {FLIGHT_PROVIDERS.map(p=>{
        const src = bestLogoFor(p.site, p.logo);
        const items = ready ? (data[p.key]||[]) : [];
        const d = deals[p.key] || {};
        return (
          <div key={p.key} className="card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <a href={p.site} target="_blank" rel="nofollow">
                <img src={src} alt={p.name} className="h-8 w-8 rounded"
                     onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = fallbackLogo(p.site); }} />
              </a>
              <div className="font-semibold">{p.name}</div>
            </div>

            {p.desc && <div className="text-sm text-white/70">{p.desc}</div>}

            {!ready && <div className="text-sm text-white/50">Compila tratta e date.</div>}

            {ready && (
              <div className="mt-1 flex flex-col gap-2">
                {loading && <div className="text-sm text-white/60">Caricamento anteprime…</div>}
                {!loading && items.length===0 && <div className="text-sm text-white/60">Nessuna anteprima. Apri la ricerca completa dal logo.</div>}
                {!loading && items.length>0 && items.map((r,i)=><Row key={i} r={r} />)}
              </div>
            )}

            {(d.code || d.note) && (
              <div className="text-xs">
                {d.code && <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 mr-2">Coupon: <b className="ml-1">{d.code}</b></span>}
                {d.note && <span className="inline-flex items-center px-2 py-1 rounded-lg bg-white/10">{d.note}</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
