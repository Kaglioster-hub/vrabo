"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui";
export type CityOpt = { label:string; value:string; country?:string };

export default function CityAutocomplete({ placeholder, value, onChange, name }:{
  placeholder: string; value: CityOpt | null; onChange: (v: CityOpt | null)=>void; name: string;
}) {
  const [open,setOpen]=useState(false); const [q,setQ]=useState(""); const [items,setItems]=useState<CityOpt[]>([]); const [hi,setHi]=useState(0);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(()=>{ const f=(e:MouseEvent)=>{const el=e.target as HTMLElement; if(!ref.current) return; if(!ref.current.parentElement?.contains(el)) setOpen(false)}; document.addEventListener("mousedown",f); return()=>document.removeEventListener("mousedown",f);},[]);
  useEffect(()=>{ const c=new AbortController(); const t=setTimeout(async()=>{
    const url = `/api/cities?${q.length<2?"top=1":("q="+encodeURIComponent(q))}`;
    try{ const r=await fetch(url,{signal:c.signal}); const d=await r.json();
      setItems((d.results||[]).map((x:any)=>({label:`${x.name}${x.country?" · "+x.country:""}`, value:x.name, country:x.country})));
    }catch{}
  },150); return()=>{ clearTimeout(t); c.abort(); };},[q]);
  function choose(i:number){ const o=items[i]; if(!o) return; onChange(o); setOpen(false); setQ(""); }
  function clear(){ onChange(null); setQ(""); ref.current?.focus(); }
  const showText = (open||q) ? q : (value?.label||"");
  return (
    <div className="relative w-full">
      <input ref={ref} name={name} className="input w-full pr-8" autoComplete="off" placeholder={placeholder}
        value={showText} onFocus={()=>{setOpen(true); if(value&&!q) setQ(value.label)}} onChange={(e)=>{setQ(e.target.value); setOpen(true);}}
        onKeyDown={(e)=>{ if(e.key==="ArrowDown"){e.preventDefault(); setHi(h=>Math.min(h+1,items.length-1));}
                          else if(e.key==="ArrowUp"){e.preventDefault(); setHi(h=>Math.max(h-1,0));}
                          else if(e.key==="Enter"){e.preventDefault(); choose(hi);}
                          else if(e.key==="Escape"){setOpen(false);} }}/>
      {(value||q) && <button className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white" title="Pulisci" onClick={clear}>×</button>}
      {open && items.length>0 && (
        <ul role="listbox" className="absolute z-40 mt-2 max-h-80 overflow-auto w-full rounded-xl border border-white/10 bg-black/80 backdrop-blur shadow-glow">
          {items.map((it,i)=>(
            <li key={it.label} role="option" aria-selected={i===hi}
                className={cn("px-3 py-2 text-sm hover:bg-white/10 cursor-pointer", i===hi && "bg-white/10")}
                onMouseEnter={()=>setHi(i)} onClick={()=>choose(i)}>{it.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
