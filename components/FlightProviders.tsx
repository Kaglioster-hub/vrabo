"use client";
import { useEffect, useState } from "react";
import { bestLogoFor, fallbackLogo } from "@/utils/logo";
import { type Deal } from "@/config/deals";

type Provider = { key:string; name:string; site:string; desc?:string; logo?:string };
const FLIGHTS: Provider[] = [
  { key:"KAYAK",     name:"KAYAK",     site:"https://www.kayak.com/",     desc:"comparatore" },
  { key:"MOMONDO",   name:"momondo",   site:"https://www.momondo.com/",   desc:"prezzi storici" },
  { key:"SKYSCANNER",name:"Skyscanner",site:"https://www.skyscanner.net/",desc:"aggregatore globale" },
  { key:"EXPEDIA",   name:"Expedia",   site:"https://www.expedia.com/",   desc:"compagnie tradizionali" },
  { key:"KIWI",      name:"Kiwi.com",  site:"https://www.kiwi.com/",      desc:"ricerca flessibile" },
];

type Picks = null | { cheap?:Meta; best?:Meta; fast?:Meta };
type Meta = { price:number; currency:string; durationMin:number; airline:string; flight_no:string; deep_link?:string; summary:string };

export default function FlightProviders({ from, to, depart, ret, adults=1, deals }:{
  from?: string; to?: string; depart?: string; ret?: string; adults?: number; deals: Record<string, Deal>;
}) {
  const ready = !!(from && to && depart);
  const [picks, setPicks] = useState<Picks>(null);
  useEffect(()=>{
    let alive=true;
    if(ready){
      const q = new URLSearchParams({ from:from!, to:to!, depart:depart!, ret:ret||"", adults:String(adults||1) });
      fetch(`/api/flights/preview?`+q.toString()).then(r=>r.json()).then(d=>{ if(alive) setPicks(d?.picks||null); }).catch(()=>{});
    } else setPicks(null);
    return ()=>{ alive=false; };
  },[from,to,depart,ret,adults,ready]);

  const fmtPrice = (n:number|undefined, cur?:string)=> n==null ? "" : `${n.toLocaleString("it-IT")} ${cur||"€"}`;
  const fmtDur = (m:number|undefined)=> m==null ? "" : (m>=60?`${Math.floor(m/60)}h ${m%60}m`:`${m}m`);

  function deeplinkFor(prov:string, m?:Meta){
    // se è Kiwi ed abbiamo il deep_link → passa da /api/out con override ?dl=
    if(prov==="KIWI" && m?.deep_link) return `/api/out?mode=flight&prov=KIWI&dl=${encodeURIComponent(m.deep_link)}`;
    // altrimenti ricerca base dello stesso viaggio
    const q = new URLSearchParams({ prov, mode:"flight", from:from||"", to:to||"", depart:depart||"", ret:ret||"", adults:String(adults||1) });
    return `/api/out?${q.toString()}`;
  }

  const chips = (prov:string)=>(
    <div className="flex flex-wrap gap-2">
      {picks?.cheap && <a className="btn btn-primary" href={deeplinkFor(prov, picks.cheap)} target="_blank" rel="nofollow">Economico · {fmtPrice(picks.cheap.price, picks.cheap.currency)} · {fmtDur(picks.cheap.durationMin)}</a>}
      {picks?.best  && <a className="btn btn-primary" href={deeplinkFor(prov, picks.best)}  target="_blank" rel="nofollow">Migliore · {fmtPrice(picks.best.price, picks.best.currency)} · {fmtDur(picks.best.durationMin)}</a>}
      {picks?.fast  && <a className="btn btn-primary" href={deeplinkFor(prov, picks.fast)}  target="_blank" rel="nofollow">Veloce · {fmtPrice(picks.fast.durationMin)} · {fmtPrice(picks.fast.price, picks.fast.currency)}</a>}
    </div>
  );

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {FLIGHTS.map(p=>{
        const d = deals[p.key] || {};
        const src = bestLogoFor(p.site, p.logo);
        return (
          <div key={p.key} className="card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <a href={`/api/out?mode=flight&prov=${p.key}${ready?`&from=${from}&to=${to}&depart=${depart}${ret?`&ret=${ret}`:""}&adults=${adults||1}`:""}`} target="_blank" rel="nofollow">
                <img src={src} alt={p.name} className="h-8 w-8 rounded" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src=fallbackLogo(p.site); }}/>
              </a>
              <div className="font-semibold">{p.name}</div>
            </div>

            {p.desc && <div className="text-sm text-white/70">{p.desc}</div>}

            {!ready && <div className="text-sm text-white/50">Compila tratta e date.</div>}
            {ready && chips(p.key)}

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
  );
}
