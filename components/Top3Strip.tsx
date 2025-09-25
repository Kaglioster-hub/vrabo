"use client";
import { useEffect, useState } from "react";
type Offer = { label:"cheap"|"best"|"fast"; price:number; currency:string; carriers:string[]; stops:number; duration:string; dep:string; arr:string; deepLink:string; };
type Top3 = { cheapest?:Offer; fastest?:Offer; best?:Offer };
export default function Top3Strip({ from, to, depart, ret, adults }:{ from:string; to:string; depart:string; ret?:string; adults:number; }){
  const ready = !!(from && to && depart);
  const [top3,setTop3]=useState<Top3|null>(null);
  useEffect(()=>{
    if(!ready){ setTop3(null); return;}
    const url=`/api/flight-top3?from=${from}&to=${to}&depart=${depart}${ret?`&ret=${ret}`:""}&adults=${adults||1}`;
    fetch(url).then(r=>r.json()).then(d=>{ setTop3(d); (window as any).__vraboTop3=d; }).catch(()=>setTop3(null));
  },[from,to,depart,ret,adults,ready]);
  if(!ready||!top3) return null;
  const items=[top3.cheapest,top3.best,top3.fastest].filter(Boolean) as Offer[];
  const label=(l:Offer["label"])=> l==="cheap"?"Economico":l==="fast"?"Veloce":"Migliore";
  return (
    <div className="my-4 mx-auto max-w-5xl rounded-2xl border border-white/10 bg-black/40 p-3 shadow-glow">
      <div className="mb-2 text-sm text-white/70 text-center">Anteprima voli (via Kiwi.com)</div>
      <div className="grid md:grid-cols-3 gap-3">
        {items.map(o=>(
          <a key={o.label} href={o.deepLink} target="_blank" rel="nofollow" className="block rounded-xl border border-white/10 p-3 hover:bg-white/10">
            <div className="flex items-center justify-between"><div className="font-semibold">{label(o.label)}</div><div className="text-lg">{o.price} {o.currency}</div></div>
            <div className="mt-1 text-sm text-white/80">{o.carriers.join(" + ")} · {o.stops===0?"diretto":`${o.stops} scali`} · {o.duration}</div>
            <div className="text-xs text-white/60">{new Date(o.dep).toLocaleString()} → {new Date(o.arr).toLocaleString()}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
