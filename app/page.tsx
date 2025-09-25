"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PlaneTakeoff, PlaneLanding, Search, Users, Shuffle, LocateFixed, X, BedDouble, Car, Phone, CreditCard } from "lucide-react";
import { Airport, displayAirport, TOP_AIRPORTS } from "@/utils/airports";
import AirportAutocomplete, { type Option } from "@/components/AirportAutocomplete";
import { saveRecent, loadRecent } from "@/utils/storage";
import Link from "next/link";
import { it } from "date-fns/locale";

const DatePicker: any = dynamic(() => import("react-datepicker"), { ssr: false });

type Recent = { from: string; to: string };
type Mode = "flight" | "stay" | "car" | "telco" | "finance";

export default function Home() {
  const [mode, setMode] = useState<Mode>("flight");

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

  const canSearchFlight = mode==="flight" && from?.value && to?.value && depart;
  const canSearchStay   = mode==="stay"   && to?.value && depart && ret;
  const canSearchCar    = mode==="car"    && to?.value && depart && ret;

  const queryCommon = `from=${from?.value||""}&to=${to?.value||""}&depart=${depart?.toISOString().slice(0,10)||""}${ret? "&return="+ret.toISOString().slice(0,10):""}&adults=${adults}`;
  const searchHref =
    mode==="flight" ? (canSearchFlight ? `/search?mode=flight&${queryCommon}${oneWay? "&oneway=1":""}` : "#") :
    mode==="stay"   ? (canSearchStay   ? `/search?mode=stay&${queryCommon}` : "#") :
    mode==="car"    ? (canSearchCar    ? `/search?mode=car&${queryCommon}` : "#") :
                      `/search?mode=${mode}&${queryCommon}`;

  function commitRecent(){ if (from?.value && to?.value) { const r = { from: from.value, to: to.value }; saveRecent("vrabo.recents", r, 6); setRecents(loadRecent<Recent>("vrabo.recents", [])); } }

  const Tab = ({k, label, Icon}:{k:Mode,label:string,Icon:any}) => (
    <button onClick={()=>setMode(k)} className={"btn " + (mode===k? "btn-primary":"")} title={label}><Icon size={16}/><span className="hidden sm:inline">{label}</span></button>
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

        {/* FORM */}
        {mode==="flight" && (
          <div className="grid md:grid-cols-[1fr_1fr] gap-4 mt-6">
            <div className="space-y-3">
              <label className="text-sm text-white/70">Da</label>
              <div className="flex gap-2 items-center">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><PlaneTakeoff size={18}/></span>
                <AirportAutocomplete name="from" placeholder="Cerca aeroporto o città..." value={from} onChange={setFrom} onQuery={onQuery} initialList={initialList} />
                <button className="btn" title="Aeroporto più vicino" onClick={useNearest}><LocateFixed size={16}/></button>
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
              <DatePicker selected={depart} onChange={setDepart} locale={it} calendarStartDay={1} showMonthDropdown showYearDropdown dropdownMode="select" showPopperArrow={false} minDate={new Date()} className="input w-full" dateFormat="dd/MM/yyyy" placeholderText="seleziona data" />
              {!oneWay && (<><label className="text-sm text-white/70">Ritorno (opz.)</label>
                <DatePicker selected={ret} onChange={setRet} locale={it} calendarStartDay={1} showMonthDropdown showYearDropdown dropdownMode="select" showPopperArrow={false} minDate={depart || new Date()} className="input w-full" dateFormat="dd/MM/yyyy" placeholderText="opzionale" /></>)}
              <label className="text-sm text-white/70">Adulti</label>
              <div className="flex items-center gap-2">
                <Users size={18} className="opacity-70"/>
                <input aria-label="Adulti" type="number" min={1} value={adults} onChange={(e)=>setAdults(parseInt(e.target.value||'1'))} className="input w-24"/>
              </div>
            </div>
          </div>
        )}

        {mode!=="flight" && (
          <div className="grid md:grid-cols-[1fr_1fr] gap-4 mt-6">
            <div className="space-y-3">
              <label className="text-sm text-white/70">{mode==="stay" ? "Destinazione" : "Luogo ritiro"}</label>
              <AirportAutocomplete name="to" placeholder="Cerca città o aeroporto..." value={to} onChange={setTo} onQuery={onQuery} initialList={initialList} />
            </div>
            <div className="space-y-3">
              <label className="text-sm text-white/70">{mode==="stay" ? "Check-in / Check-out" : "Ritiro / Riconsegna"}</label>
              <DatePicker
                selected={depart} onChange={(d:any)=>setDepart(d)} startDate={depart} endDate={ret} selectsRange
                locale={it} calendarStartDay={1} showPopperArrow={false} monthsShown={2}
                className="input w-full" dateFormat="dd/MM/yyyy" placeholderText="seleziona intervallo" />
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <Link href={searchHref} onClick={commitRecent} className={"btn btn-primary text-base px-5 py-3" + ((mode==="flight"&&canSearchFlight)||(mode==="stay"&&canSearchStay)||(mode==="car"&&canSearchCar) ? "" : " pointer-events-none opacity-50")}>
            <Search size={18}/> Cerca
          </Link>
          {mode==="flight" && (!from?.value || !to?.value || !depart) && (<span className="text-sm text-white/60">Compila { !from?.value ? "origine" : !to?.value ? "destinazione" : "data andata" } per procedere.</span>)}
          {(mode==="stay" || mode==="car") && (!to?.value || !depart || !ret) && (<span className="text-sm text-white/60">Seleziona destinazione e intervallo date.</span>)}
        </div>

        {recents.length>0 && mode==="flight" && (
          <div className="mt-6">
            <div className="text-sm text-white/70 mb-2">Ricerche recenti</div>
            <div className="flex flex-wrap gap-2">
              {recents.map((r, i) => (
                <button key={i} className="btn" onClick={()=>{ setFrom({label:r.from, value:r.from}); setTo({label:r.to, value:r.to}); }}>
                  {r.from} <span className="opacity-60">→</span> {r.to}
                </button>
              ))}
              <button className="btn" onClick={()=>{ localStorage.removeItem("vrabo.recents"); setRecents([]); }}><X size={14}/> Pulisci</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
