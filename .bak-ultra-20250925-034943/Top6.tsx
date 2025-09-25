"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { googleFlightsURL, skyscannerURL } from "@/lib/deeplinks";
import { AFF } from "@/lib/affiliates";

type Offer = {
  price:number; airline?:string; departure_at:string; return_at?:string;
  transfers:number; duration:number; origin:string; destination:string;
};

export default function Top6({ className="" }:{ className?:string }){
  const sp = useSearchParams();
  const origin = (sp.get("from")||"").toUpperCase();
  const destination = (sp.get("to")||"").toUpperCase();
  const depart = sp.get("d1")||"";
  const ret = sp.get("d2")||"";
  const pax = +(sp.get("pax")||"1");
  const direct = sp.get("dir")==="1";
  const cabin = (sp.get("cls")||"economy") as any;

  const [offers,setOffers] = useState<Offer[]|null>(null);

  useEffect(()=>{
    if(!origin || !destination || !depart){ setOffers(null); return; }
    const q = `/api/flights/search?origin=${origin}&destination=${destination}&depart=${depart}${ret?`&return=${ret}`:""}`;
    fetch(q).then(r=>r.json()).then(d=>setOffers(d.offers||[])).catch(()=>setOffers([]));
  },[origin,destination,depart,ret]);

  if(!origin || !destination || !depart) return null;

  return (
    <section className={`section ${className}`}>
      <h2 className="text-xl font-semibold mb-3">Migliori offerte</h2>
      {!offers && <p className="text-white/60">Caricamento…</p>}
      {offers && offers.length===0 && <p className="text-white/60">Nessuna offerta al momento.</p>}
      {offers && offers.length>0 &&
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {offers.slice(0,6).map((o,i)=>(
            <div key={i} className="offer-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{o.origin} → {o.destination}</div>
                <div className="text-lg font-bold">{o.price.toLocaleString("it-IT",{style:"currency",currency:"EUR"})}</div>
              </div>
              <div className="text-sm text-white/70">
                Partenza: {new Date(o.departure_at).toLocaleString("it-IT")}
                {o.return_at ? <><br/>Ritorno: {new Date(o.return_at).toLocaleString("it-IT")}</> : null}
                <br/>Scali: {o.transfers} • Durata: {Math.round(o.duration/60)}h
              </div>
              <div className="mt-3 flex gap-2">
                <a className="btn btn-sm btn-outline" target="_blank"
                   href={googleFlightsURL({from:o.origin,to:o.destination,depart:depart,ret:ret||undefined,pax, direct, cabin})}>Google Flights</a>
                <a className="btn btn-sm btn-outline" target="_blank"
                   href={skyscannerURL({from:o.origin,to:o.destination,depart:depart,ret:ret||undefined,pax})}>Skyscanner</a>
                {AFF.flights.primary && <a className="btn btn-sm btn-primary" target="_blank" href={AFF.flights.primary}>Trip</a>}
              </div>
            </div>
          ))}
        </div>
      }
    </section>
  );
}
