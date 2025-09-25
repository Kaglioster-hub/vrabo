"use client";
import { useEffect, useRef, useState } from "react";
import { Airport, displayAirport } from "@/utils/airports";
import { cn } from "@/components/ui";
import { X } from "lucide-react";
export type Option = { label: string; value: string; raw?: Airport };

export default function AirportAutocomplete({ placeholder, value, onChange, onQuery, initialList = [], name }:{
  placeholder: string; value: Option | null; onChange: (opt: Option | null)=>void; onQuery: (q: string)=>void; initialList?: Airport[]; name: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Option[]>([]);
  const [hi, setHi] = useState(0);
  const ref = useRef<HTMLInputElement>(null);

  // chiudi su click-out
  useEffect(()=>{ const f=(e:MouseEvent)=>{const el=e.target as HTMLElement; if(!ref.current) return; if(!ref.current.parentElement?.contains(el)) setOpen(false)}; document.addEventListener("mousedown",f); return()=>document.removeEventListener("mousedown",f);},[]);
  // prelista
  useEffect(()=>{ setItems(initialList.map(a=>({label:displayAirport(a), value:a.iata_code||"", raw:a}))); },[initialList]);

  // quando metti il focus, carica nel campo il valore attuale così puoi riscriverlo
  function onFocusInput(){
    setOpen(true);
    if (value && !query) setQuery(value.label);
  }

  // ricerca con debounce
  useEffect(()=>{ const c=new AbortController(); const t=setTimeout(async()=>{
    if(query.length<2){ setItems(initialList.map(a=>({label:displayAirport(a), value:a.iata_code||"", raw:a}))); return; }
    try{ onQuery(query); const r=await fetch(`/api/airports?q=${encodeURIComponent(query)}`,{signal:c.signal}); const d=await r.json();
      setItems((d.results||[]).slice(0,12).map((a:Airport)=>({label:displayAirport(a), value:a.iata_code||"", raw:a})));
    }catch{}
  },180); return()=>{clearTimeout(t); c.abort();}; },[query]);

  function choose(i:number){ const opt=items[i]; if(!opt) return; onChange(opt); setOpen(false); setQuery(""); }
  function clear(){ setQuery(""); onChange(null); ref.current?.focus(); }

  const showText = (open || query) ? query : (value?.label||"");

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
        className="input w-full pr-9"
        onFocus={onFocusInput}
        value={showText}
        onChange={(e)=>{ setQuery(e.target.value); setOpen(true); }}
        onKeyDown={(e)=>{ if(e.key==="ArrowDown"){e.preventDefault(); setHi(h=>Math.min(h+1,items.length-1));}
                          else if(e.key==="ArrowUp"){e.preventDefault(); setHi(h=>Math.max(h-1,0));}
                          else if(e.key==="Enter"){e.preventDefault(); choose(hi);}
                          else if(e.key==="Escape"){setOpen(false);} }}
      />
      {!!(value || query) && (
        <button className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white" title="Pulisci" onClick={clear}><X size={16}/></button>
      )}
      {open && items.length>0 && (
        <ul id={name+"-listbox"} role="listbox" className="absolute z-40 mt-2 max-h-80 overflow-auto w-full rounded-xl border border-white/10 bg-black/80 backdrop-blur shadow-glow">
          {items.map((it,i)=>(
            <li key={it.value+it.label} role="option" aria-selected={i===hi}
                className={cn("px-3 py-2 text-sm hover:bg-white/10 cursor-pointer", i===hi && "bg-white/10")}
                onMouseEnter={()=>setHi(i)} onClick={()=>choose(i)}>{it.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
