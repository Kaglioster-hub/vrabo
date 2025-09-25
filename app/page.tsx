"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, PlaneTakeoff, PlaneLanding, Search, Users, Shuffle, LocateFixed, X } from "lucide-react";
import { Airport, displayAirport, TOP_AIRPORTS } from "@/utils/airports";
import AirportAutocomplete, { type Option } from "@/components/AirportAutocomplete";
import { saveRecent, loadRecent } from "@/utils/storage";
import Link from "next/link";

const DatePicker: any = dynamic(() => import("react-datepicker"), { ssr: false });

type Recent = { from: string; to: string };

export default function Home() {
  const [from, setFrom] = useState<Option | null>(null);
  const [to, setTo] = useState<Option | null>(null);
  const [depart, setDepart] = useState<Date | null>(null);
  const [ret, setRet] = useState<Date | null>(null);
  const [oneWay, setOneWay] = useState(false);
  const [adults, setAdults] = useState(1);
  const [initialList, setInitialList] = useState<Airport[]>([]);
  const [recents, setRecents] = useState<Recent[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/airports?top=1`);
      const data = await res.json();
      setInitialList(data.results || []);
    })();
    setRecents(loadRecent<Recent>("vrabo.recents", []));
  }, []);

  function onQuery(_: string) {}
  function swap(){ const a = from; const b = to; setFrom(b); setTo(a); }

  async function useNearest(){
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 8000 }));
      const lat = pos.coords.latitude; const lng = pos.coords.longitude;
      const r = await fetch(`/api/airports?near=${lat},${lng}`);
      const data = await r.json();
      if ((data.results||[]).length) {
        const a = data.results[0] as Airport;
        setFrom({ label: displayAirport(a), value: a.iata_code||"", raw: a });
      }
    } catch {}
  }

  const canSearch = from?.value && to?.value && depart;
  const searchHref = canSearch
    ? `/search?from=${from?.value}&to=${to?.value}&depart=${depart?.toISOString().slice(0,10)}${(!oneWay && ret) ? "&return=" + ret.toISOString().slice(0,10) : ""}&adults=${adults}`
    : "#";

  function commitRecent(){
    if (from?.value && to?.value) {
      const r = { from: from.value, to: to.value };
      saveRecent("vrabo.recents", r, 6);
      setRecents(loadRecent<Recent>("vrabo.recents", []));
    }
  }

  return (
    <main className="space-y-6">
      <section className="card p-6">
        <h1 className="h1-grad">VRABO — Fly, Sleep, Drive. One Search.</h1>
        <p className="text-white/70 mt-2">Trova voli, hotel e auto nel mondo. Confrontiamo i comparatori: tu scegli.</p>

        <div className="grid md:grid-cols-[1fr_1fr] gap-4 mt-6">
          <div className="space-y-3">
            <label className="text-sm text-white/70">Da</label>
            <div className="flex gap-2 items-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><PlaneTakeoff size={18}/></span>
              <AirportAutocomplete name="from" placeholder="Cerca aeroporto o città..." value={from} onChange={setFrom} onQuery={onQuery} initialList={initialList} />
              <button className="btn" title="Usa il mio aeroporto più vicino" onClick={useNearest}><LocateFixed size={16}/></button>
            </div>

            <label className="text-sm text-white/70">A</label>
            <div className="flex gap-2 items-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><PlaneLanding size={18}/></span>
              <AirportAutocomplete name="to" placeholder="Cerca aeroporto o città..." value={to} onChange={setTo} onQuery={onQuery} initialList={initialList} />
              <button className="btn" title="Inverti" onClick={swap}><Shuffle size={16}/></button>
            </div>

            <div className="text-xs text-white/60">
              Suggerimenti:&nbsp;
              {TOP_AIRPORTS.map(a => (
                <button key={a} onClick={()=>!from ? setFrom({label:a, value:a}) : setTo({label:a, value:a})} className="mx-1 underline hover:text-white">{a}</button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/70">Andata</label>
              <label className="text-xs inline-flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="accent-yellow-400" checked={oneWay} onChange={(e)=>{ setOneWay(e.target.checked); if(e.target.checked) setRet(null); }} />
                Solo andata
              </label>
            </div>
            <DatePicker selected={depart} onChange={setDepart} minDate={new Date()} className="input w-full" dateFormat="yyyy-MM-dd" placeholderText="seleziona data" />
            {!oneWay && (<><label className="text-sm text-white/70">Ritorno (opz.)</label><DatePicker selected={ret} onChange={setRet} minDate={depart || new Date()} className="input w-full" dateFormat="yyyy-MM-dd" placeholderText="opzionale" /></>)}
            <label className="text-sm text-white/70">Adulti</label>
            <div className="flex items-center gap-2">
              <Users size={18} className="opacity-70"/>
              <input aria-label="Adulti" type="number" min={1} value={adults} onChange={(e)=>setAdults(parseInt(e.target.value||'1'))} className="input w-24"/>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <Link href={searchHref} onClick={commitRecent} className={"btn btn-primary text-base px-5 py-3" + (canSearch ? "" : " pointer-events-none opacity-50")}>
            <Search size={18}/> Cerca
          </Link>
          {(!from?.value || !to?.value || !depart) && (<span className="text-sm text-white/60">Compila { !from?.value ? "origine" : !to?.value ? "destinazione" : "data andata" } per procedere.</span>)}
        </div>

        {recents.length>0 && (
          <div className="mt-6">
            <div className="text-sm text-white/70 mb-2">Ricerche recenti</div>
            <div className="flex flex-wrap gap-2">
              {recents.map((r, i) => (
                <button key={i} className="btn" onClick={()=>{ setFrom({label:r.from, value:r.from}); setTo({label:r.to, value:r.to}); }}>
                  {r.from} <ArrowRight size={14}/> {r.to}
                </button>
              ))}
              <button className="btn" onClick={()=>{ localStorage.removeItem("vrabo.recents"); setRecents([]); }}><X size={14}/> Pulisci</button>
            </div>
          </div>
        )}
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold">Come monetizziamo</h2>
        <p className="text-white/70">Usiamo link affiliati legali verso partner (es. Booking, Rentalcars, Kiwi, Skyscanner). Nessun sovrapprezzo per te.</p>
        <div className="mt-3 flex gap-3">
          <a className="btn" href={process.env.NEXT_PUBLIC_PAYPAL_ME || "#"} target="_blank">Dona via PayPal</a>
          <button className="btn" onClick={()=>navigator.clipboard.writeText(process.env.NEXT_PUBLIC_CRYPTO_ADDRESS || "")}>Copia wallet crypto</button>
        </div>
      </section>
    </main>
  );
}
