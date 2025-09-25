"use client";

import { useEffect, useRef, useState } from "react";
import { searchItems } from "@/lib/search";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const debRef = useRef<any>();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => {
      setResults(searchItems(q, 8));
    }, 120);
    return () => clearTimeout(debRef.current);
  }, [q]);

  const showDrop = focus && (q.length > 0 || results.length > 0);

  return (
    <div className="relative">
      <div className="flex items-center rounded-2xl bg-black/40 border border-white/20 focus-within:border-white/50 shadow-inner">
        <Search className="ml-3 text-white/50" size={20} />
        <input
          ref={inputRef}
          className="flex-1 h-14 bg-transparent px-3 text-lg outline-none placeholder-white/40 text-white"
          placeholder="Cerca in VRABO (CTRL+K)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 150)}
        />
        <button
          className="btn-gold mr-2"
          onClick={() => inputRef.current?.blur()}
        >
          Cerca
        </button>
      </div>

      <AnimatePresence>
        {showDrop && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 mt-2 card p-2"
          >
            {results.length === 0 ? (
              <div className="p-3 text-white/60">Nessun risultato. Prova con un termine diverso.</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {results.map((r) => (
                  <li key={r.id} className="py-2">
                    <Link
                      href={r.url}
                      target="_blank"
                      className="flex justify-between items-center p-2 hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <div>
                        <div className="font-semibold">{r.title}</div>
                        <p className="text-xs text-white/60">{r.description}</p>
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
