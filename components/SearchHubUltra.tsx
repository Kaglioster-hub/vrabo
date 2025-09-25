"use client";
import { useState } from "react";
import Autocomplete from "@/components/Autocomplete";
import { googleFlightsURL, skyscannerURL, tripHotelURL, carURL, gygURL, type Cabin } from "@/lib/deeplinks";

type Mode = "flights"|"hotels"|"cars"|"experiences";

export default function SearchHubUltra({ defaultMode="flights" as Mode }:{ defaultMode?:Mode }){
  const [mode,setMode] = useState<Mode>(defaultMode);
  const [from,setFrom] = useState<{code:string,label:string}|null>(null);
  const [to,setTo]     = useState<{code:string,label:string}|null>(null);
  const [city,setCity] = useState<{label:string}|null>(null);

  const today = new Date();
  const plus3 = new Date(Date.now()+1000*60*60*24*3);
  const [d1,setD1] = useState<string>(today.toISOString().slice(0,10));
  const [d2,setD2] = useState<string>(plus3.toISOString().slice(0,10));

  // flights extras
  const [oneway,setOneway] = useState(false);
  const [pax,setPax] = useState(1);
  const [direct,setDirect] = useState(false);
  const [cabin,setCabin] = useState<Cabin>("economy");

  // hotels extras
  const [rooms,setRooms] = useState(1);
  const [adults,setAdults] = useState(2);
  const [children,setChildren] = useState(0);

  function swap(){ const a = from; setFrom(to); setTo(a); }

  function go(){
    if(mode==="flights"){
      if(!from || !to){ alert("Seleziona origine e destinazione"); return; }
      const q = { from:from.code, to:to.code, depart:d1, ret: oneway? undefined : d2, pax, cabin, direct };
      window.open(googleFlightsURL(q), "_blank","noopener");
      window.open(skyscannerURL(q),   "_blank","noopener");
      const u = new URL(window.location.href);
      u.searchParams.set("from", from.code);
      u.searchParams.set("to", to.code);
      u.searchParams.set("d1", d1);
      if(!oneway) u.searchParams.set("d2", d2); else u.searchParams.delete("d2");
      u.searchParams.set("pax", String(pax));
      u.searchParams.set("dir", direct ? "1" : "0");
      u.searchParams.set("cls", cabin);
      history.replaceState(null,"",u.toString());
    }else if(mode==="hotels"){
      if(!city){ alert("Scegli la città"); return; }
      window.open(tripHotelURL({ city: city.label.split(",")[0], checkin:d1, checkout:d2, rooms, adults, children }), "_blank","noopener");
    }else if(mode==="cars"){
      window.open(carURL({ preferLocalrent:true }), "_blank","noopener");
    }else{
      if(!city){ alert("Scegli la città"); return; }
      window.open(gygURL(city.label.split(",")[0], d1), "_blank","noopener");
    }
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {[["flights","Voli"],["hotels","Alloggi"],["cars","Auto"],["experiences","Esperienze"]].map(([m,label])=>(
          <button key={m} className={`btn btn-ghost btn-sm ${mode===m ? "border-white/40" : ""}`} onClick={()=>setMode(m as Mode)}>{label}</button>
        ))}
      </div>

      {mode==="flights" && (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 items-center">
          <Autocomplete mode="airport" placeholder="Da (città o aeroporto)" onPick={setFrom}/>
          <div className="flex gap-2 items-center">
            <button onClick={swap} className="btn btn-ghost sm:hidden">↔</button>
            <Autocomplete mode="airport" placeholder="A (città o aeroporto)" onPick={setTo} className="flex-1"/>
          </div>
          <input type="date" className="input" value={d1} onChange={e=>setD1(e.target.value)}/>
          <input type="date" className="input" value={d2} onChange={e=>setD2(e.target.value)} disabled={oneway}/>
          <button onClick={go} className="btn btn-primary">Cerca voli</button>

          <div className="sm:col-span-5 mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={oneway} onChange={e=>setOneway(e.target.checked)} /> Solo andata</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={direct} onChange={e=>setDirect(e.target.checked)} /> Solo diretti</label>
            <div className="flex items-center gap-2">Passeggeri
              <button className="chip" onClick={()=>setPax(Math.max(1,pax-1))}>–</button><span className="chip">{pax}</span><button className="chip" onClick={()=>setPax(pax+1)}>+</button>
            </div>
            <select className="input h-[42px]" value={cabin} onChange={e=>setCabin(e.target.value as Cabin)}>
              <option value="economy">Economy</option>
              <option value="premium_economy">Premium</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
          </div>
        </div>
      )}

      {mode==="hotels" && (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
          <Autocomplete mode="city" placeholder="Dove? (città)" onPick={setCity}/>
          <input type="date" className="input" value={d1} onChange={e=>setD1(e.target.value)}/>
          <input type="date" className="input" value={d2} onChange={e=>setD2(e.target.value)}/>
          <button onClick={go} className="btn btn-primary">Cerca alloggi</button>
          <div className="sm:col-span-4 mt-2 grid grid-cols-3 sm:grid-cols-6 gap-2 text-sm">
            <div className="flex items-center gap-2">Camere
              <button className="chip" onClick={()=>setRooms(Math.max(1,rooms-1))}>–</button><span className="chip">{rooms}</span><button className="chip" onClick={()=>setRooms(rooms+1)}>+</button>
            </div>
            <div className="flex items-center gap-2">Adulti
              <button className="chip" onClick={()=>setAdults(Math.max(1,adults-1))}>–</button><span className="chip">{adults}</span><button className="chip" onClick={()=>setAdults(adults+1)}>+</button>
            </div>
            <div className="flex items-center gap-2">Bambini
              <button className="chip" onClick={()=>setChildren(Math.max(0,children-1))}>–</button><span className="chip">{children}</span><button className="chip" onClick={()=>setChildren(children+1)}>+</button>
            </div>
          </div>
        </div>
      )}

      {mode==="cars" && (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-center">
          <Autocomplete mode="city" placeholder="Città/luogo di ritiro (apre partner)" onPick={setCity}/>
          <input type="date" className="input" value={d1} onChange={e=>setD1(e.target.value)}/>
          <input type="date" className="input" value={d2} onChange={e=>setD2(e.target.value)}/>
          <div className="sm:col-span-3"><button onClick={go} className="btn btn-primary mt-2 sm:mt-0">Cerca auto</button></div>
        </div>
      )}

      {mode==="experiences" && (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-center">
          <Autocomplete mode="city" placeholder="Città (tour, biglietti, attività)" onPick={setCity}/>
          <input type="date" className="input" value={d1} onChange={e=>setD1(e.target.value)}/>
          <div className="sm:col-span-2"><button onClick={go} className="btn btn-primary mt-2 sm:mt-0">Cerca esperienze</button></div>
        </div>
      )}
    </div>
  );
}
