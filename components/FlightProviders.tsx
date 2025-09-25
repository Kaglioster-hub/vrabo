"use client";
import { useEffect, useState } from "react";
import { bestLogoFor, fallbackLogo } from "@/utils/logo";
import { type Deal } from "@/config/deals";

type Provider = { key:string; name:string; site:string; desc?:string; logo?:string };
const FLIGHT_PROVIDERS: Provider[] = [
  { key:"KAYAK",     name:"KAYAK",     site:"https://www.kayak.com/",      desc:"comparatore" },
  { key:"MOMONDO",   name:"momondo",   site:"https://www.momondo.com/",    desc:"prezzi storici" },
  { key:"SKYSCANNER",name:"Skyscanner",site:"https://www.skyscanner.net/", desc:"aggregatore globale" },
  { key:"EXPEDIA",   name:"Expedia",   site:"https://www.expedia.com/",    desc:"compagnie tradizionali" },
  { key:"KIWI",      name:"Kiwi.com",  site:"https://www.kiwi.com/",       desc:"ricerca flessibile" },
];

type PreviewItem = { price:number; currency:string; duration:number; stops:number; summary:string; deepLink?:string };

export default function FlightProviders({
  from, to, depart, ret, adults=1, deals
}:{ from?:string; to?:string; depart?:string; ret?:string; adults?:number; deals: Record<string, Deal> }) {

  const ready = !!(from && to && depart);
  const [top3,setTop3] = useState<PreviewItem[]|null>(null);
  const [loading,setLoading] = useState(false);

  useEffect(()=>{
    let alive = true;
    setTop3(null);
    if(ready){
      setLoading(true);
      const qs = new URLSearchParams({ from: from!, to: to!, depart: depart!, ret: ret||"", adults: String(adults||1) });
      fetch("/api/flights/preview?"+qs.toString())
        .then(r=>r.json())
        .then(j=>{ if(alive) setTop3(Array.isArray(j?.items)? j.items : []); })
        .catch(()=>{})
        .finally(()=>{ if(alive) setLoading(false); });
    }
    return ()=>{ alive=false };
  },[from,to,depart,ret,adults,ready]);

  const ResultRow = ({r, prov}:{r:PreviewItem, prov:string})=>{
    const href = (prov==="KIWI" && r.deepLink)
      ? r.deepLink!
      : \`/api/out?mode=flight&prov=\${prov}&from=\${encodeURIComponent(from||"")}&to=\${encodeURIComponent(to||"")}&depart=\${depart||""}&ret=\${ret||""}&adults=\${adults||1}&hint_price=\${r.price||""}&hint_dur=\${r.duration||""}&hint_stops=\${r.stops||""}\`;
    return (
      <a href={href} target="_blank" rel="nofollow"
         className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
        <div className="text-sm">{r.summary}</div>
        <div className="font-semibold">{r.price!=null ? ("€"+Math.round(r.price)) : "n/d"}</div>
      </a>
    );
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {FLIGHT_PROVIDERS.map(p=>{
        const src = bestLogoFor(p.site, p.logo);
        const d   = deals[p.key] || {};
        return (
          <div key={p.key} className="card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img src={src} alt={p.name} className="h-8 w-8 rounded"
                   onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = fallbackLogo(p.site); }}/>
              <div className="font-semibold">{p.name}</div>
            </div>
            {p.desc && <div className="text-sm text-white/70">{p.desc}</div>}

            {!ready && <div className="text-sm text-white/50">Compila tratta e date.</div>}
            {ready && (
              <div className="mt-2 flex flex-col gap-2">
                {loading && <div className="text-sm text-white/60">Caricamento migliori opzioni…</div>}
                {!loading && top3 && top3.length>0 && top3.map((r, i)=>(
                  <ResultRow key={i} r={r} prov={p.key}/>
                ))}
                {!loading && top3 && top3.length===0 && (
                  <div className="text-sm text-white/60">Nessuna anteprima disponibile.</div>
                )}
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
