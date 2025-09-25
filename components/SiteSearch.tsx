"use client";
import { useEffect, useRef, useState } from "react";
import { searchItems } from "@/lib/search";
import { Search } from "lucide-react";
import Link from "next/link";

export default function SiteSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [res, setRes] = useState<any[]>([]);
  const [idx, setIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const deb = useRef<any>();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); inputRef.current?.focus(); setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    clearTimeout(deb.current);
    deb.current = setTimeout(() => {
      const r = searchItems(q, 8);
      setRes(r); setIdx(r.length ? 0 : -1);
    }, 120);
    return () => clearTimeout(deb.current);
  }, [q]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((p)=>Math.min(p+1,res.length-1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setIdx((p)=>Math.max(p-1,0)); }
    if (e.key === "Enter") {
      if (idx>=0 && res[idx]) window.open(res[idx].url, "_blank");
      else if (res[0]) window.open(res[0].url, "_blank");
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="relative hidden md:flex items-center">
      <div className="header-search" onMouseDown={(e)=>{ e.preventDefault(); inputRef.current?.focus(); }}>
        <Search size={16} className="ml-2 opacity-60" />
        <input
          ref={inputRef}
          className="header-search-input"
          placeholder="Cerca nel sito (CTRL+K)"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          onFocus={()=>setOpen(true)}
          onBlur={()=>setTimeout(()=>setOpen(false),120)}
          onKeyDown={onKeyDown}
        />
      </div>
      {open && (
        <div className="header-search-dropdown">
          {res.length === 0 ? (
            <div className="px-3 py-2 text-sm text-white/70">Nessun risultato…</div>
          ) : res.map((r,i)=>(
            <Link
              key={r.id}
              href={r.url}
              target="_blank"
              className={`flex justify-between items-center px-3 py-2 rounded-lg ${i===idx ? "bg-white/10" : "hover:bg-white/5"}`}
              onMouseEnter={()=>setIdx(i)}
            >
              <span className="text-sm">{r.title}</span>
              <span className="text-xs text-white/60">{r.category}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
