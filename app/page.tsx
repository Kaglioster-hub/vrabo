"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, PlaneTakeoff, PlaneLanding, Search, Users } from "lucide-react";
import { Airport, displayAirport, TOP_AIRPORTS } from "@/utils/airports";
import Link from "next/link";

const DatePicker: any = dynamic(() => import("react-datepicker"), { ssr: false });

type Option = { label: string; value: string; raw?: Airport };

function useAirportSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string| null>(null);
  const [list, setList] = useState<Airport[]>([]);

  async function search(q: string) {
    if (!q || q.length < 2) {
      setList([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/airports?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setList(data.results || []);
    } catch (e:any) {
      setError(e.message || "Errore ricerca aeroporti");
    } finally {
      setLoading(false);
    }
  }

  async function popular() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/airports?top=1`);
      const data = await res.json();
      setList(data.results || []);
    } catch (e:any) {
      setError(e.message || "Errore caricamento");
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, list, search, popular };
}

export default function Home() {
  const [from, setFrom] = useState<Option | null>(null);
  const [to, setTo] = useState<Option | null>(null);
  const [depart, setDepart] = useState<Date | null>(null);
  const [ret, setRet] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);

  const { list, search, popular } = useAirportSearch();
  const [field, setField] = useState<"from"|"to">("from");

  useEffect(() => { popular(); }, []);

  function toOption(a: Airport): Option {
    return { label: displayAirport(a), value: a.iata_code || "", raw: a };
  }

  const options = useMemo(() => list.map(toOption), [list]);

  function onQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    search(q);
  }

  function applyOption(opt: Option) {
    if (field === "from") setFrom(opt);
    else setTo(opt);
  }

  const canSearch = from?.value && to?.value && depart;

  const searchHref = canSearch
    ? `/search?from=${from?.value}&to=${to?.value}&depart=${depart?.toISOString().slice(0,10)}${ret ? "&return=" + ret.toISOString().slice(0,10) : ""}&adults=${adults}`
    : "#";

  return (
    <main className="space-y-6">
      <section className="card p-6">
        <h1 className="h1-grad">VRABO — Fly, Sleep, Drive. One Search.</h1>
        <p className="text-white/70 mt-2">
          Trova voli, hotel e auto nel mondo. Confrontiamo i comparatori: tu scegli.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="space-y-3">
            <label className="text-sm text-white/70">Da</label>
            <div className="flex gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><PlaneTakeoff size={18}/></span>
              <input onFocus={()=>setField("from")} onChange={onQueryChange} placeholder="Cerca aeroporto o città..." className="input w-full" />
            </div>

            <label className="text-sm text-white/70">A</label>
            <div className="flex gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><PlaneLanding size={18}/></span>
              <input onFocus={()=>setField("to")} onChange={onQueryChange} placeholder="Cerca aeroporto o città..." className="input w-full" />
            </div>

            <div className="text-xs text-white/60">
              Suggerimenti: {TOP_AIRPORTS.map(a => <button key={a} onClick={()=>applyOption({label:a, value:a})} className="mx-1 underline hover:text-white">{a}</button>)}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm text-white/70">Andata</label>
            <DatePicker
              selected={depart} onChange={setDepart}
              minDate={new Date()}
              className="input w-full"
              dateFormat="yyyy-MM-dd"
            />
            <label className="text-sm text-white/70">Ritorno (opz.)</label>
            <DatePicker
              selected={ret} onChange={setRet}
              minDate={depart || new Date()}
              className="input w-full"
              dateFormat="yyyy-MM-dd"
              placeholderText="opzionale"
            />
            <label className="text-sm text-white/70">Adulti</label>
            <div className="flex items-center gap-2">
              <Users size={18} className="opacity-70"/>
              <input type="number" min={1} value={adults} onChange={(e)=>setAdults(parseInt(e.target.value||'1'))} className="input w-24"/>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={searchHref} className={"btn btn-primary" + (canSearch ? "" : " pointer-events-none opacity-50")}>
            <Search size={18}/> Cerca
          </Link>
          {from && <span className="text-sm text-white/70">Selezionato: <b>{from.label}</b> → <b>{to?.label || "?"}</b></span>}
        </div>

        {/* Results dropdown */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {options.slice(0, 12).map(opt => (
            <button key={opt.value+opt.label} onClick={()=>applyOption(opt)} className="card p-3 text-left hover:bg-white/10">
              {opt.label}
            </button>
          ))}
        </div>
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
