"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PlaneTakeoff, PlaneLanding, Search, Users, Shuffle, LocateFixed, X, BedDouble, Car, Phone, CreditCard } from "lucide-react";

import AirportAutocomplete, { type Option } from "@/components/AirportAutocomplete";
import CityAutocomplete, { type CityOpt } from "@/components/CityAutocomplete";
import { SingleDate, RangeDate } from "@/components/NiceDate";
import ProviderGrid from "@/components/ProviderGrid";
import { Airport, displayAirport, TOP_AIRPORTS } from "@/utils/airports";
import { TELCO_PROVIDERS, FINANCE_PROVIDERS } from "@/config/providers";
import { saveRecent, loadRecent } from "@/utils/storage";
import dynamic from "next/dynamic";
const FlightProviders = dynamic(() => import("@/components/FlightProviders").then(m => m.default), { ssr: false });
const HotelProviders  = dynamic(() => import("@/components/HotelProviders").then(m => m.default), { ssr: false });
const CarProviders    = dynamic(() => import("@/components/CarProviders").then(m => m.default),  { ssr: false });
type Mode = "flight" | "stay" | "car" | "telco" | "finance";
type Recent = { from: string; to: string };

const POP_CITIES = ["Roma","Milano","Parigi","Barcellona","Londra","New York","Dubai","Istanbul","Tokyo","Bangkok","Berlino","Amsterdam"];
const CAR_PLACES = ["FCO","MXP","LIN","LHR","CDG","BCN","MAD","JFK","LAX","FRA","MUC","ATH","NCE","PMI","AGP","CAG","CTA"];
const ESIM_COUNTRIES = ["Italia","Spagna","Francia","Germania","USA","Regno Unito","Turchia","Grecia","Thailandia","Giappone"];

export default function Home() {
  const [mode, setMode] = useState<Mode>("flight");

  // Flight
  const [from, setFrom] = useState<Option|null>(null);
  const [to, setTo] = useState<Option|null>(null);
  const [depart, setDepart] = useState<Date|null>(null);
  const [ret, setRet] = useState<Date|null>(null);
  const [oneWay, setOneWay] = useState(false);
  const [adults, setAdults] = useState(1);
  const [initialAirports, setInitialAirports] = useState<Airport[]>([]);
  const [recents, setRecents] = useState<Recent[]>([]);

  // Stay
  const [cityTo, setCityTo] = useState<CityOpt|null>(null);

  // Deals (fetched once; usati dai provider grids)
  const [dealsTelco, setDealsTelco] = useState<Record<string, any>>({});
  const [dealsFin, setDealsFin] = useState<Record<string, any>>({});
  const [dealsCar, setDealsCar] = useState<Record<string, any>>({});
  const [dealsStay, setDealsStay] = useState<Record<string, any>>({});
  const [dealsFlight, setDealsFlight] = useState<Record<string, any>>({});

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/airports?top=1`);
        const d = await r.json();
        setInitialAirports(d.results || []);
      } catch {}
    })();
    setRecents(loadRecent<Recent>("vrabo.recents", []));
    fetch("/api/deals?mode=telco").then(r=>r.json()).then(d=>setDealsTelco(d.deals||{}));
    fetch("/api/deals?mode=finance").then(r=>r.json()).then(d=>setDealsFin(d.deals||{}));
    fetch("/api/deals?mode=car").then(r=>r.json()).then(d=>setDealsCar(d.deals||{}));
    fetch("/api/deals?mode=stay").then(r=>r.json()).then(d=>setDealsStay(d.deals||{}));
    fetch("/api/deals?mode=flight").then(r=>r.json()).then(d=>setDealsFlight(d.deals||{}));
  }, []);

  function swap(){ const a = from; const b = to; setFrom(b); setTo(a); }
  async function useNearest(){
    try{
      const pos = await new Promise<GeolocationPosition>((res, rej)=>navigator.geolocation.getCurrentPosition(res, rej, {enableHighAccuracy:true, timeout:8000}));
      const r = await fetch(`/api/airports?near=${pos.coords.latitude},${pos.coords.longitude}`);
      const d = await r.json(); const a = (d.results||[])[0] as Airport|undefined;
      if (a) setFrom({label:displayAirport(a), value:a.iata_code||"", raw:a});
    }catch{}
  }
  function commitRecent(){
    if (from?.value && to?.value) {
      saveRecent("vrabo.recents", {from:from.value, to:to.value}, 6);
      setRecents(loadRecent<Recent>("vrabo.recents", []));
    }
  }

  const canSearchFlight = mode==="flight" && from?.value && to?.value && depart;
  const canSearchStay   = mode==="stay"   && cityTo?.value && depart && ret;
  const canSearchCar    = mode==="car"    && to?.value && depart && ret;

  const qCommon = `from=${from?.value||""}&to=${to?.value||""}&depart=${depart?.toISOString().slice(0,10)||""}${ret? "&return="+ret.toISOString().slice(0,10):""}&adults=${adults}`;
  const searchHref =
    mode==="flight" ? (canSearchFlight ? `/search?mode=flight&${qCommon}${oneWay? "&oneway=1":""}` : "#") :
    mode==="stay"   ? (canSearchStay   ? `/search?mode=stay&to=${encodeURIComponent(cityTo!.value)}&depart=${depart?.toISOString().slice(0,10)}&return=${ret?.toISOString().slice(0,10)}&adults=${adults}` : "#") :
    mode==="car"    ? (canSearchCar    ? `/search?mode=car&${qCommon}` : "#") :
    mode==="telco"  ? `/search?mode=telco` : `/search?mode=finance`;

  const Tab = ({k, label, Icon}:{k:Mode,label:string,Icon:any}) => (
    <button onClick={()=>setMode(k)} className={"btn " + (mode===k? "btn-primary":"")} title={label}>
      <Icon size={16}/><span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <main className="space-y-6">
      <section className="card p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <Tab k="flight" label="Voli"        Icon={PlaneTakeoff}/>
          <Tab k="stay"   label="Pernottamento" Icon={BedDouble}/>
          <Tab k="car"    label="Noleggio"    Icon={Car}/>
          <Tab k="telco"  label="Telefonia"   Icon={Phone}/>
          <Tab k="finance"label="Finanza"     Icon={CreditCard}/>
        </div>

        <h1 className="h1-grad">VRABO — Comparator of Comparators.</h1>
        <p className="text-white/70 mt-2">Trova voli, hotel, auto, telefonia e servizi finanziari nel mondo.</p>

        {/* VOLI */}
        {mode==="flight" && (
          <div className="grid md:grid-cols-[1fr_1fr] gap-4 mt-6">
            <div className="space-y-3">
              <label className="text-sm text-white/70">Da</label>
              <div className="flex gap-2 items-center">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><PlaneTakeoff size={18}/></span>
                <AirportAutocomplete name="from" placeholder="Cerca aeroporto o città..." value={from} onChange={setFrom} onQuery={()=>{}} initialList={initialAirports} />
                <button className="btn" title="Aeroporto più vicino" onClick={useNearest}><LocateFixed size={16}/></button>
              </div>

              <label className="text-sm text-white/70">A</label>
              <div className="flex gap-2 items-center">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><PlaneLanding size={18}/></span>
                <AirportAutocomplete name="to" placeholder="Cerca aeroporto o città..." value={to} onChange={setTo} onQuery={()=>{}} initialList={initialAirports} />
                <button className="btn" title="Inverti" onClick={swap}><Shuffle size={16}/></button>
              </div>

              <div className="text-xs text-white/60">
                Suggerimenti:&nbsp;{TOP_AIRPORTS.map(a=> (
                  <button key={a} onClick={()=>!from?setFrom({label:a,value:a}):setTo({label:a,value:a})} className="mx-1 underline hover:text-white">{a}</button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/70">Andata</label>
                <label className="text-xs inline-flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="accent-yellow-400" checked={oneWay}
                    onChange={(e)=>{ setOneWay(e.target.checked); if(e.target.checked) setRet(null); }} />
                  Solo andata
                </label>
              </div>
              <SingleDate selected={depart} onChange={setDepart as any} minDate={new Date()} placeholderText="seleziona data" />
              {!oneWay && (<>
                <label className="text-sm text-white/70">Ritorno (opz.)</label>
                <SingleDate selected={ret} onChange={setRet as any} minDate={depart || new Date()} placeholderText="opzionale" />
              </>)}
              <label className="text-sm text-white/70">Adulti</label>
              <div className="flex items-center gap-2">
                <Users size={18} className="opacity-70"/>
                <input aria-label="Adulti" type="number" min={1} value={adults} onChange={(e)=>setAdults(parseInt(e.target.value||"1"))} className="input w-24"/>
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <FlightProviders from={from?.value} to={to?.value}
                depart={depart?.toISOString().slice(0,10)}
                ret={ret?.toISOString().slice(0,10)}
                adults={adults} deals={dealsFlight}/>
            </div>
          </div>
        )}

        {/* PERNOTTAMENTO */}
        {mode==="stay" && (
          <div className="grid md:grid-cols-[1fr_1fr] gap-4 mt-6">
            <div className="space-y-3">
              <label className="text-sm text-white/70">Destinazione</label>
              <CityAutocomplete name="to" placeholder="Città, zona o POI" value={cityTo} onChange={setCityTo}/>
              <div className="text-xs text-white/60">
                Città popolari:&nbsp;{POP_CITIES.map(c=>(
                  <button key={c} onClick={()=>setCityTo({label:c,value:c})} className="mx-1 underline hover:text-white">{c}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm text-white/70">Check-in / Check-out</label>
              <RangeDate startDate={depart} endDate={ret} onChange={(r:any)=>{ const [a,b]=r as [Date|null,Date|null]; setDepart(a); setRet(b); }} placeholderText="seleziona intervallo" />
              <label className="text-sm text-white/70">Adulti</label>
              <div className="flex items-center gap-2">
                <Users size={18} className="opacity-70"/>
                <input aria-label="Adulti" type="number" min={1} value={adults} onChange={(e)=>setAdults(parseInt(e.target.value||"1"))} className="input w-24"/>
              </div>
            </div>
            <div className="md:col-span-2 pt-2">
              <HotelProviders city={cityTo?.value}
                checkin={depart?.toISOString().slice(0,10)}
                checkout={ret?.toISOString().slice(0,10)}
                adults={adults} deals={dealsStay}/>
            </div>
          </div>
        )}

        {/* NOLEGGIO — campi esistenti + griglia partner */}
        {mode==="car" && (
          <div className="grid md:grid-cols-[1fr_1fr] gap-4 mt-6">
            <div className="space-y-3">
              <label className="text-sm text-white/70">Luogo ritiro</label>
              <AirportAutocomplete name="to" placeholder="Città o aeroporto di ritiro" value={to} onChange={setTo} onQuery={()=>{}} initialList={initialAirports}/>
              <div className="text-xs text-white/60">
                Luoghi comuni:&nbsp;{CAR_PLACES.map(c=>(
                  <button key={c} onClick={()=>setTo({label:c,value:c})} className="mx-1 underline hover:text-white">{c}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm text-white/70">Ritiro / Riconsegna</label>
              <RangeDate startDate={depart} endDate={ret} onChange={(r:any)=>{ const [a,b]=r as [Date|null,Date|null]; setDepart(a); setRet(b); }} placeholderText="seleziona intervallo" />
            </div>
            <div className="md:col-span-2 pt-2">
              <CarProviders city={to?.value} pickup={depart?.toISOString().slice(0,10)} dropoff={ret?.toISOString().slice(0,10)} deals={dealsCar}/>
            </div>
          </div>
        )}

        {/* TELCO */}
        {mode==="telco" && (
          <>
            <p className="mt-4 text-white/70 text-sm">Paesi eSIM più richiesti:&nbsp;
              {ESIM_COUNTRIES.map(c=><span key={c} className="mx-1">{c}</span>)}
            </p>
            <div className="mt-4"><ProviderGrid items={TELCO_PROVIDERS} deals={dealsTelco}/></div>
          </>
        )}

        {/* FINANZA */}
        {mode==="finance" && (
          <div className="mt-4"><ProviderGrid items={FINANCE_PROVIDERS} deals={dealsFin}/></div>
        )}

        {(mode==="flight" || mode==="stay" || mode==="car") && (
          <div className="mt-6 flex flex-wrap gap-3 items-center">
            <Link href={searchHref} onClick={commitRecent}
              className={"btn btn-primary text-base px-5 py-3" + ((mode==="flight"&&canSearchFlight)||(mode==="stay"&&canSearchStay)||(mode==="car"&&canSearchCar) ? "" : " pointer-events-none opacity-50")}>
              <Search size={18}/> Cerca
            </Link>
            {mode==="flight" && (!from?.value || !to?.value || !depart) && (<span className="text-sm text-white/60">Compila { !from?.value ? "origine" : !to?.value ? "destinazione" : "data andata" } per procedere.</span>)}
            {mode==="stay"   && (!cityTo?.value || !depart || !ret) && (<span className="text-sm text-white/60">Seleziona destinazione e intervallo date.</span>)}
            {mode==="car"    && (!to?.value || !depart || !ret) && (<span className="text-sm text-white/60">Seleziona destinazione e intervallo date.</span>)}
          </div>
        )}

        {recents.length>0 && mode==="flight" && (
          <div className="mt-6">
            <div className="text-sm text-white/70 mb-2">Ricerche recenti</div>
            <div className="flex flex-wrap gap-2">
              {recents.map((r,i)=>(
                <button key={i} className="btn" onClick={()=>{ setFrom({label:r.from,value:r.from}); setTo({label:r.to,value:r.to}); }}>
                  {r.from} <span className="opacity-60">→</span> {r.to}
                </button>
              ))}
              <button className="btn" onClick={()=>{ localStorage.removeItem("vrabo.recents"); setRecents([]); }}>
                <X size={14}/> Pulisci
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}






