"use client";
import { useEffect, useRef, useState } from "react";
import { searchItems } from "@/lib/search";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Search } from "lucide-react";

export default function OmniSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [idx, setIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const debRef = useRef<any>();

  // focus con CTRL/CMD+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // debounce search
  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => {
      const r = searchItems(q, 10);
      setResults(r);
      setIdx(r.length ? 0 : -1);
    }, 120);
    return () => clearTimeout(debRef.current);
  }, [q]);

  // click su QUALSIASI punto del contenitore -> focus input (fix del tuo problema)
  const onWrapMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // evita che il blur chiuda il menu mentre clicchi dentro
    e.preventDefault();
    inputRef.current?.focus();
    setOpen(true);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((p) => Math.min(p + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setIdx((p) => Math.max(p - 1, 0)); }
    if (e.key === "Escape")    { setOpen(false); inputRef.current?.blur(); }
    if (e.key === "Enter") {
      if (idx >= 0 && results[idx]) {
        window.open(results[idx].url, "_blank");
      } else if (results[0]) {
        window.open(results[0].url, "_blank");
      }
    }
  };

  return (
    <div className="relative z-20 max-w-3xl mx-auto px-4">
      <div
        ref={wrapRef}
        className="omnibox group"
        onMouseDown={onWrapMouseDown}
      >
        <Search className="ml-3 opacity-60 group-focus-within:opacity-100" size={20} />
        <input
          ref={inputRef}
          className="omnibox-input"
          placeholder="Cerca in VRABO (CTRL+K)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="omni-list"
        />
        <button
          className="btn-gold mr-2"
          onMouseDown={(e) => { e.preventDefault(); }}  // evita blur
          onClick={() => {
            if (results[0]) window.open(results[0].url, "_blank");
          }}
        >
          Cerca
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="omni-dropdown"
          >
            {results.length === 0 ? (
              <div className="p-3 text-white/60">Nessun risultato (prova “MusicRadar”, “Token”, “ADREuropa”…)</div>
            ) : (
              <ul id="omni-list" role="listbox" className="divide-y divide-white/10">
                {results.map((r, i) => (
                  <li key={r.id}>
                    <Link
                      role="option"
                      aria-selected={i === idx}
                      href={r.url}
                      target="_blank"
                      className={`flex items-center justify-between gap-3 p-3 rounded-xl ${i===idx ? "bg-white/10" : "hover:bg-white/5"}`}
                      onMouseEnter={() => setIdx(i)}
                    >
                      <div>
                        <div className="font-semibold">{r.title}</div>
                        <div className="text-xs text-white/60">{r.description}</div>
                        <div className="mt-1 flex gap-1 flex-wrap">
                          {r.tags?.map((t:string) => <span key={t} className="badge">{t}</span>)}
                        </div>
                      </div>
                      <span className="text-xs text-white/60">{r.category}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
