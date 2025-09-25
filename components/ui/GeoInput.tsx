"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Suggest = { id?: string; label: string; sublabel?: string; code?: string; type?: string };

type Props = {
  value: string;
  onChange: (v:string)=>void;
  onSelect?: (s:Suggest)=>void;
  placeholder?: string;
  required?: boolean;
  mode?: "place" | "airport";
  minChars?: number;
};

export default function GeoInput({
  value, onChange, onSelect,
  placeholder="Città o aeroporto (mondo)",
  required, mode="airport", minChars=1
}: Props) {
  const [open,setOpen] = useState(false);
  const [list,setList] = useState<Suggest[]>([]);
  const [idx,setIdx]   = useState(-1);
  const [menuStyle,setMenuStyle] = useState<React.CSSProperties>({});
  const [portalEl,setPortalEl] = useState<HTMLElement|null>(null);
  const ref = useRef<HTMLInputElement|null>(null);
  const deb = useRef<any>();

  useEffect(()=>{ setPortalEl(document.body); }, []);

  function positionMenu(){
    const el = ref.current; if(!el) return;
    const r = el.getBoundingClientRect();
    setMenuStyle({ position:"fixed", top:r.bottom+4, left:r.left, width:r.width, zIndex:10000 });
  }

  useEffect(()=>{ const on=()=>open&&positionMenu();
    window.addEventListener("scroll", on, true);
    window.addEventListener("resize", on);
    return ()=>{ window.removeEventListener("scroll", on, true); window.removeEventListener("resize", on); };
  }, [open]);

  // Body scroll lock quando il menu è aperto
  useEffect(()=>{
    if(!open) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPr = body.style.paddingRight;
    const scrollBar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if(scrollBar>0) body.style.paddingRight = `${scrollBar}px`;
    return ()=>{ body.style.overflow = prevOverflow; body.style.paddingRight = prevPr; };
  },[open]);

  useEffect(()=>{
    clearTimeout(deb.current);
    deb.current = setTimeout(async ()=>{
      const q = value.trim();
      const u = new URL("/api/geo/autocomplete", window.location.origin);
      u.searchParams.set("q", q.length < minChars ? "" : q);
      try{
        const r = await fetch(u.toString());
        const j = await r.json();
        const items:Suggest[] = (j.items||[]).map((raw:any)=>({
          id:raw.id||raw.code||raw.label, label:raw.label||"", sublabel:raw.sublabel||"", code:raw.code, type:raw.type
        }));
        setList(items); setIdx(items.length?0:-1); positionMenu();
      }catch{ setList([]); setIdx(-1); }
    },120);
    return ()=>clearTimeout(deb.current);
  }, [value,mode,minChars]);

  function commit(s: Suggest){ onChange(s.code ? s.code : s.label); setOpen(false); onSelect?.(s); }
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>){
    if(!open || !list.length) return;
    if(e.key==="ArrowDown"){ e.preventDefault(); setIdx(p=>Math.min(p+1, list.length-1)); }
    if(e.key==="ArrowUp"){ e.preventDefault(); setIdx(p=>Math.max(p-1, 0)); }
    if(e.key==="Enter"){ e.preventDefault(); if(idx>=0) commit(list[idx]); }
    if(e.key==="Escape"){ setOpen(false); }
  }

  const portal = open && portalEl ? createPortal(
    <>
      <div
        className="ac-overlay"
        onMouseDown={(e)=>{ e.preventDefault(); e.stopPropagation(); setOpen(false); }}
        onWheel={(e)=>{ e.stopPropagation(); }}
      />
      <ul
        className="ac-menu"
        style={menuStyle}
        role="listbox"
        aria-label="Suggerimenti"
        onMouseDownCapture={(e)=>e.stopPropagation()}
        onWheelCapture={(e)=>e.stopPropagation()}
      >
        {list.map((s,i)=>(
          <li key={s.id ?? i}
            role="option" aria-selected={i===idx}
            className={`ac-item ${i===idx ? "is-active":""}`}
            onMouseEnter={()=>setIdx(i)}
            onMouseDown={(ev)=>{ ev.preventDefault(); ev.stopPropagation(); commit(s); }}
            title={s.sublabel || s.type || ""}
          >
            <div className="font-medium">{s.label}</div>
            <div className="text-xs opacity-70">{s.code ? `${s.code} · ` : ""}{s.sublabel || s.type || ""}</div>
          </li>
        ))}
      </ul>
    </>, portalEl) : null;

  return (
    <div className="w-full" onSubmitCapture={()=>setOpen(false)}>
      <input
        ref={ref} className="input w-full"
        placeholder={placeholder} value={value}
        onChange={e=>{ onChange(e.target.value); setOpen(true); }}
        onFocus={()=>{ setOpen(true); positionMenu(); }}
        onKeyDown={onKeyDown} required={required} aria-expanded={open}
      />
      {portal}
    </div>
  );
}
