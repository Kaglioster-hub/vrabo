"use client";

import { useEffect, useRef, useState } from "react";
import { Airport, displayAirport } from "@/utils/airports";
import { cn } from "@/components/ui";

export type Option = { label: string; value: string; raw?: Airport };

export default function AirportAutocomplete({
  placeholder, value, onChange, onQuery, initialList = [], name,
}: {
  placeholder: string; value: Option | null;
  onChange: (opt: Option) => void; onQuery: (q: string) => void;
  initialList?: Airport[]; name: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Option[]>([]);
  const [highlight, setHighlight] = useState(0);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!ref.current) return;
      if (!ref.current.parentElement?.contains(el)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // preload
  useEffect(() => {
    setItems(initialList.map(a => ({ label: displayAirport(a), value: a.iata_code||"", raw: a })));
  }, [initialList]);

  // debounced query
  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      if (query.length < 2) {
        setItems(initialList.map(a => ({ label: displayAirport(a), value: a.iata_code||"", raw: a })));
        return;
      }
      try {
        onQuery(query);
        const res = await fetch(`/api/airports?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        const data = await res.json();
        const opts = (data.results || []).slice(0, 12).map((a:Airport) =>
          ({ label: displayAirport(a), value: a.iata_code||"", raw: a })
        );
        setItems(opts);
      } catch {}
    }, 180);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [query]);

  function choose(i: number) {
    const opt = items[i]; if (!opt) return;
    onChange(opt); setOpen(false); setQuery("");
  }

  return (
    <div className="relative w-full">
      <input
        ref={ref}
        name={name}
        role="combobox"
        aria-expanded={open}
        aria-controls={name+"-listbox"}
        autoComplete="off"
        placeholder={placeholder}
        className="input w-full"
        onFocus={() => setOpen(true)}
        value={value?.label || query}
        onChange={(e)=>{ setQuery(e.target.value); setOpen(true); }}
        onKeyDown={(e)=>{
          if(e.key==="ArrowDown"){ e.preventDefault(); setHighlight(h=>Math.min(h+1, items.length-1)); }
          else if(e.key==="ArrowUp"){ e.preventDefault(); setHighlight(h=>Math.max(h-1, 0)); }
          else if(e.key==="Enter"){ e.preventDefault(); choose(highlight); }
          else if(e.key==="Escape"){ setOpen(false); }
        }}
      />
      {open && items.length>0 && (
        <ul id={name+"-listbox"} role="listbox"
            className="absolute z-20 mt-2 max-h-80 overflow-auto w-full rounded-xl border border-white/10 bg-black/80 backdrop-blur shadow-glow">
          {items.map((it, i) => (
            <li key={it.value+it.label} role="option" aria-selected={i===highlight}
                className={cn("px-3 py-2 text-sm hover:bg-white/10 cursor-pointer", i===highlight && "bg-white/10")}
                onMouseEnter={()=>setHighlight(i)} onClick={()=>choose(i)}>
              {it.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
