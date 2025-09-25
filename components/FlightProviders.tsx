"use client";
import { bestLogoFor, fallbackLogo } from "@/utils/logo";
import { Deal } from "@/config/deals";

type Provider = { key:string; name:string; site:string; desc?:string; logo?:string; enabled?:boolean };

const FLIGHTS: Provider[] = [
  { key:"KAYAK",     name:"KAYAK",     site:"https://www.kayak.com/",     desc:"comparatore", enabled:true },
  { key:"MOMONDO",   name:"momondo",   site:"https://www.momondo.com/",   desc:"prezzi storici", enabled:true },
  { key:"SKYSCANNER",name:"Skyscanner",site:"https://www.skyscanner.net/",desc:"aggregatore globale", enabled:true },
  { key:"EXPEDIA",   name:"Expedia",   site:"https://www.expedia.com/",   desc:"compagnie tradizionali", enabled:true },
];

type Offer = {
  label:"cheap"|"best"|"fast";
  price:number; currency:string; carriers:string[]; stops:number;
  duration:string; dep:string; arr:string; deepLink:string;
};
type Top3 = { cheapest?:Offer; fastest?:Offer; best?:Offer };

const sortKey = (l:Offer["label"]) => l==="cheap"?"cheap":(l==="fast"?"fast":"best");
const label = (l:Offer["label"]) => l==="cheap"?"Economico":l==="fast"?"Veloce":"Migliore";

export default function FlightProviders({ from, to, depart, ret, adults=1, deals, top3 }:{
  from?: string; to?: string; depart?: string; ret?: string; adults?: number;
  deals: Record<string, Deal>; top3?: Top3|null;
}) {
  const ready = !!(from && to && depart);
  const rows: Offer[] = [];
  if(top3?.cheapest) rows.push(top3.cheapest);
  if(top3?.best)     rows.push(top3.best);
  if(top3?.fastest)  rows.push(top3.fastest);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {FLIGHTS.filter(p=>p.enabled!==false).map(p=>{
        const src = bestLogoFor(p.site, p.logo);
        const baseProv = `/api/out?mode=flight&prov=${p.key}&from=${from||""}&to=${to||""}&depart=${depart||""}&ret=${ret||""}&adults=${adults||1}`;
        const mkProv = (s:string)=> `${baseProv}&sort=${s}`;
        return (
          <div key={p.key} className="card p-4 flex flex-col gap-3 opacity-100">
            <div className="flex items-center gap-3">
              <a href={ready?mkProv("best"):"#"} onClick={(e)=>{ if(!ready) e.preventDefault(); }}>
                <img src={src} alt={p.name} className="h-8 w-8 rounded"
                     onError={(e)=>{ (e.currentTarget as HTMLImageElement).src=fallbackLogo(p.site); }}/>
              </a>
              <div className="font-semibold">{p.name}</div>
            </div>
            {p.desc && <div className="text-sm text-white/70">{p.desc}</div>}

            {!ready && <div className="text-xs text-white/50">Compila tratta e date.</div>}

            {ready && rows.length>0 && (
              <div className="mt-1 flex flex-col gap-2">
                {rows.map((o)=>(
                  <div key={o.label} className="rounded-lg border border-white/10 p-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-medium">{label(o.label)}</div>
                      <div className="font-semibold">{o.price} {o.currency}</div>
                    </div>
                    <div className="text-xs text-white/70">
                      {o.carriers.join(" + ")} · {o.stops===0?"diretto":`${o.stops} scali`} · {o.duration}
                    </div>
                    <div className="mt-1 flex gap-2">
                      <a className="btn btn-primary" href={o.deepLink} target="_blank" rel="nofollow">Prenota</a>
                      <a className="btn" href={mkProv(sortKey(o.label))} target="_blank" rel="nofollow">Apri su {p.name}</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
