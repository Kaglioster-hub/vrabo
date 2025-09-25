"use client";
import { useMemo, useState } from "react";
import { AIRPORTS, CITIES, type City, type Airport } from "@/lib/geo";

export type Suggestion = { code: string; label: string };
type Mode = "airport" | "city";

export default function Autocomplete({
  mode,
  placeholder,
  onPick,
  className = "",
}: {
  mode: Mode;
  placeholder?: string;
  onPick: (s: Suggestion) => void;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    if (mode === "airport") {
      return AIRPORTS.filter(a =>
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q)
      ).slice(0, 8);
    }
    return CITIES.filter(c =>
      c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [mode, query]);

  function pick(x: City | Airport) {
    if ("code" in x) {
      onPick({ code: x.code, label: `${x.city} — ${x.name} (${x.code})` });
    } else {
      onPick({ code: x.city.toUpperCase(), label: `${x.city}, ${x.country}` });
    }
    setOpen(false);
    setQuery(x.city);
  }

  return (
    <div className={`relative ${className}`}>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="input w-full"
        autoComplete="off"
      />
      {open && list.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-black/90 backdrop-blur p-1 shadow-xl">
          {list.map((x, i) => (
            <button
              key={i}
              onClick={() => pick(x as any)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5"
            >
              {"code" in x ? (
                <div className="font-medium">
                  {(x as Airport).city} — {(x as Airport).name}{" "}
                  <span className="text-white/60">({(x as Airport).code})</span>
                </div>
              ) : (
                <div className="font-medium">
                  {(x as City).city},{" "}
                  <span className="text-white/60">{(x as City).country}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
