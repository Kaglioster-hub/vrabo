"use client";

/**
 * ================================================================
 * SearchBarUltraPro.tsx – MEGA UNIFICATA EDITION ⚡
 * ================================================================
 * - Modalità: general, flight, hotel/bnb, car
 * - Suggest con cache LRU, debounce, abort, single-flight dedupe
 * - ARIA combobox + aria-live + aria-busy
 * - Ghost hint + Tab completion + Enter/ESC
 * - Hotkeys (/ e Cmd/Ctrl+K), Voice input (if available), Swap voli
 * - Recent/Popular/Pinned con localStorage (dedupe)
 * - Date UX: vincoli check-in/out e partenza/ritorno
 * - Output coerente: onSubmit riceve sempre un payload oggetto
 * - Affiliate redirect automatico (Aviasales, Booking, Localrent)
 * ================================================================
 */

import { useEffect, useMemo, useRef, useState, useId } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/* ---------- Tipi ---------- */
export type Item = {
  key: string;
  name: string;
  type?: string;
  country?: string;
  code?: string;
};

export interface SearchBarUltraProProps {
  mode?: "general" | "flight" | "hotel" | "bnb" | "car";
  value?: string;
  onChange?: (val: string) => void;
  onSubmit?: (payload: any) => void;
  onPick?: (item: Item) => void;
  recent?: Item[];
  popular?: Item[];
  pinned?: Item[];
  placeholder?: string;
  className?: string;
  suggestUrl?: string;
  debounceMs?: number;
  minChars?: number;
  maxResults?: number;
  preloadOnFocus?: boolean;
  enableVoice?: boolean;
  hotkeys?: boolean;
  storageKey?: string;
  historyMax?: number;
  onError?: (err: any) => void;
}

/* --- Popular cities fallback --- */
const POPULAR_CITIES: Item[] = [
  { key: "roma", name: "Roma", type: "city", country: "Italia" },
  { key: "milano", name: "Milano", type: "city", country: "Italia" },
  { key: "firenze", name: "Firenze", type: "city", country: "Italia" },
  { key: "napoli", name: "Napoli", type: "city", country: "Italia" },
  { key: "parigi", name: "Parigi", type: "city", country: "Francia" },
  { key: "londra", name: "Londra", type: "city", country: "UK" },
  { key: "tokyo", name: "Tokyo", type: "city", country: "Giappone" },
];

/* ---------- Componente ---------- */
export default function SearchBarUltraPro({
  mode = "general",
  value,
  onChange,
  onSubmit,
  onPick,
  recent = [],
  popular = POPULAR_CITIES,
  pinned = [],
  placeholder = "Cerca destinazione o servizio…",
  className = "",
  suggestUrl = "/api/suggest",
  debounceMs = 250,
  minChars = 1, // ⚡ già da 1 carattere parte
  maxResults = 50,
  preloadOnFocus = true,
  enableVoice = true,
  hotkeys = true,
  storageKey = "vrabo.search.recent",
  historyMax = 12,
  onError,
}: SearchBarUltraProProps) {
  /* ---------- Styling ---------- */
  const inputStyle =
    "w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 " +
    "bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none";

  /* ---------- Stato ---------- */
  const [inner, setInner] = useState("");
  const val = (value ?? inner).toString();
  const setVal = (v: string) => (onChange ? onChange(v) : setInner(v));

  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [flat, setFlat] = useState<any[]>([]);
  const [hi, setHi] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState("");
  const [errMsg, setErrMsg] = useState("");

  // Multi-field
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dest, setDest] = useState("");
  const [pickup, setPickup] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  /* ---------- Refs ---------- */
  const abortRef = useRef<AbortController | null>(null);
  const debRef = useRef<NodeJS.Timeout | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const cacheRef = useRef(new LRUCache(200, 300000)); // 5 min TTL
  const inflightRef = useRef(new Map());
  const seqRef = useRef(0);
  const historyRef = useRef(loadHistory(storageKey, recent));

  const uid = useId();
  const listboxId = `sb-ultra-listbox-${uid}`;
  const activeId = hi >= 0 ? `${listboxId}-row-${hi}` : undefined;

  /* ---------- Placeholder dinamico ---------- */
  const ph = useMemo(() => {
    if (mode === "flight") return "Da/Per (es. Roma FCO → JFK)";
    if (mode === "car") return "Punto ritiro auto";
    if (mode === "bnb" || mode === "hotel") return "Città/Hotel (es. Firenze – Duomo)";
    return placeholder;
  }, [mode, placeholder]);
  /* ---------- Hotkeys globali ---------- */
  useEffect(() => {
    if (!hotkeys) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const typing =
        tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable;
      if (!typing && (e.key === "/" || (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)))) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, hotkeys]);

  /* ---------- Cleanup ---------- */
  useEffect(() => () => {
    if (debRef.current) clearTimeout(debRef.current);
    abortRef.current?.abort();
  }, []);

  /* ---------- Click esterno ---------- */
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  /* ---------- Static sections ---------- */
  const buildStaticSections = () => {
    const hist = historyRef.current;
    const sec = [];
    if (pinned?.length) sec.push({ key: "pinned", title: "Consigliati", items: normalizeArray(pinned) });
    if (hist?.length) sec.push({ key: "recent", title: "Recenti", items: normalizeArray(hist) });
    if (popular?.length) sec.push({ key: "popular", title: "Popolari", items: normalizeArray(popular) });
    return sec;
  };
  const openStaticIfAny = () => {
    const secs = buildStaticSections();
    const f = flattenSections(secs);
    setSections(secs);
    setFlat(f);
    setHint("");
    setHi(firstRowIndex(f));
    setOpen(secs.some((s) => s.items.length > 0));
  };

  /* ---------- Suggest engine ---------- */
  useEffect(() => {
    if (mode !== "general") return;

    if (!val.trim()) {
      setErrMsg("");
      setHint("");
      setHi(-1);
      if (preloadOnFocus && document.activeElement === inputRef.current) {
        openStaticIfAny();
      } else {
        setSections([]);
        setFlat([]);
        setOpen(false);
      }
      return;
    }

    if (val.trim().length < minChars) {
      const secs = fuzzyFilterSections(buildStaticSections(), val);
      const f = flattenSections(secs);
      setSections(secs);
      setFlat(f);
      setHint(bestHintFromSections(secs, val));
      setHi(firstRowIndex(f));
      setOpen(secs.some((s) => s.items.length));
      return;
    }

    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(async () => {
      const q = val.trim();
      const key = `${suggestUrl}|${mode}|${q}|${maxResults}`;
      const seq = ++seqRef.current;

      if (cacheRef.current.has(key)) {
        applySuggestions(q, cacheRef.current.get(key), seq);
        return;
      }
      if (inflightRef.current.has(key)) {
        try {
          const sug = await inflightRef.current.get(key);
          if (seqRef.current === seq) applySuggestions(q, sug, seq);
        } catch {}
        return;
      }

      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setLoading(true);
      setErrMsg("");

      const p = (async () => {
        const url = `${suggestUrl}?q=${encodeURIComponent(q)}&mode=${mode}&limit=${maxResults}`;
        const r = await fetch(url, { signal: abortRef.current?.signal });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        return Array.isArray(j?.suggestions) ? j.suggestions : [];
      })();

      inflightRef.current.set(key, p);
      try {
        const suggestions = await p;
        cacheRef.current.set(key, suggestions);
        if (seqRef.current === seq) applySuggestions(q, suggestions, seq);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          const secs = fuzzyFilterSections(buildStaticSections(), q);
          const f = flattenSections(secs);
          setSections(secs);
          setFlat(f);
          setHint(bestHintFromSections(secs, q));
          setHi(firstRowIndex(f));
          setOpen(secs.some((s) => s.items.length));
          setErrMsg("⚠️ Connessione lenta, fallback locale.");
          onError?.(err);
        }
      } finally {
        inflightRef.current.delete(key);
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debRef.current) clearTimeout(debRef.current);
    };
  }, [val, mode, minChars, maxResults, suggestUrl, debounceMs, preloadOnFocus]);

  function applySuggestions(q: string, suggestions: any[], seq: number) {
    if (seq !== seqRef.current) return;
    const normalized = normalizeArray(suggestions).slice(0, maxResults);
    const secs = [
      ...(pinned?.length ? [{ key: "pinned", title: "Consigliati", items: normalizeArray(pinned) }] : []),
      { key: "suggested", title: "Suggeriti", items: normalized },
      ...(historyRef.current?.length ? [{ key: "recent", title: "Recenti", items: normalizeArray(historyRef.current) }] : []),
    ];
    const f = flattenSections(secs);
    setSections(secs);
    setFlat(f);
    setHint(bestHint(normalized, q));
    setHi(firstRowIndex(f));
    setOpen(secs.some((s) => s.items.length));
    setErrMsg("");
  }
  /* ---------- Submit ---------- */
  const doSubmit = () => {
    let payload: any = {};
    if (mode === "flight") {
      payload = { from, to, depart: startDate, return: endDate, type: "flight" };
    } else if (mode === "hotel" || mode === "bnb") {
      payload = { dest, checkin: startDate, checkout: endDate, type: mode };
    } else if (mode === "car") {
      payload = { pickup, from: startDate, to: endDate, type: "car" };
    } else {
      payload = { query: val, type: "general" };
      saveHistory(storageKey, historyRef, val, historyMax);
    }
    onSubmit?.(payload);
    setOpen(false);
  };

  const pick = (item: Item) => {
    const name = item?.name ?? "";
    if (!name) return;
    setVal(name);
    setOpen(false);
    setHint("");
    saveHistory(storageKey, historyRef, name, historyMax);
    onPick?.(item);
    onSubmit?.({ query: name, picked: item, type: "general" });
  };

  const swapFlight = () => {
    if (mode !== "flight") return;
    setFrom(to);
    setTo(from);
  };

  const onStartDate = (d: Date | null) => {
    setStartDate(d);
    if (endDate && d && endDate < d) setEndDate(d);
  };
  const onEndDate = (d: Date | null) => {
    if (startDate && d && d < startDate) setEndDate(startDate);
    else setEndDate(d);
  };

  const onVoice = () => {
    if (!enableVoice) return;
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    try {
      const rec = new SR();
      rec.lang = "it-IT";
      rec.onresult = (ev: any) => {
        const t = ev?.results?.[0]?.[0]?.transcript || "";
        if (t) {
          if (mode === "general") setVal(t);
          else setDest(t);
        }
      };
      rec.start();
    } catch (e) {
      onError?.(e);
    }
  };

  const showClear = mode === "general" ? !!val : !!dest;

  /* ---------- Render ---------- */
  return (
    <div
      ref={boxRef}
      className={`relative w-full p-4 rounded-xl shadow-lg bg-white dark:bg-gray-900 ${className}`}
    >
      {/* General */}
      {mode === "general" && (
        <div className="relative">
          {/* Ghost hint */}
          <div className="absolute inset-y-0 left-4 right-28 flex items-center pointer-events-none z-0">
            <span className="truncate text-gray-400 select-none">
              <span className="invisible">{val}</span>
              <span className="opacity-40">
                {validHint(val, hint) ? hint.slice(val.length) : ""}
              </span>
            </span>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onFocus={() => {
              if (!val.trim() && preloadOnFocus) openStaticIfAny();
              else setOpen(flat.length > 0);
            }}
            onBlur={() => {
              requestAnimationFrame(() => {
                if (!boxRef.current?.contains(document.activeElement)) setOpen(false);
              });
            }}
            onKeyDown={(e) =>
              handleKeyDown(e, flat, hi, setHi, pick, doSubmit, val, hint, setVal, setOpen)
            }
            placeholder={ph}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            aria-busy={loading}
            className={`${inputStyle} pr-28 relative z-10`}
          />

          {/* Controls */}
          <div className="absolute inset-y-0 right-2 flex items-center gap-1 z-20">
            {enableVoice && <IconBtn title="Dettatura vocale" onClick={onVoice}>🎤</IconBtn>}
            {showClear && (
              <IconBtn
                title="Pulisci"
                onClick={() => {
                  setVal("");
                  setHint("");
                  setOpen(false);
                  setHi(-1);
                  inputRef.current?.focus();
                }}
              >
                ⨯
              </IconBtn>
            )}
          </div>

          {/* Dropdown */}
          {open && (
            <div
              id={listboxId}
              ref={listRef}
              role="listbox"
              aria-live="polite"
              className="absolute z-50 mt-2 w-full max-h-96 overflow-auto bg-white dark:bg-gray-800 border rounded-xl shadow-xl"
            >
              {loading && <RowInfo text="⏳ Carico suggerimenti…" />}
              {!loading && !flat.some((r) => r.__type === "item") && (
                <RowInfo text={errMsg || "Nessun risultato"} />
              )}
              {!loading &&
                flat.map((row, idx) => {
                  if (row.__type === "header") {
                    return (
                      <div
                        key={row.key}
                        className="px-3 py-1 text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur z-10"
                      >
                        {row.title}
                      </div>
                    );
                  }
                  const active = idx === hi;
                  const item = row.item as Item;
                  const subtitle = [item.country, item.code].filter(Boolean).join(" · ");
                  const icon = iconFor(item.type || guessType(item, mode));
                  return (
                    <div
                      id={`${listboxId}-row-${idx}`}
                      key={`${item.key}-${idx}`}
                      role="option"
                      aria-selected={active}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setHi(idx)}
                      onClick={() => pick(item)}
                      className={`px-4 py-2 cursor-pointer flex items-center gap-2 ${
                        active ? "bg-blue-50 dark:bg-gray-700" : ""
                      }`}
                    >
                      <span className="shrink-0">{icon}</span>
                      <div className="min-w-0">
                        <div className="truncate">{highlightText(item.name, val)}</div>
                        {subtitle && (
                          <div className="text-xs text-gray-500 truncate">{subtitle}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Flight */}
      {mode === "flight" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 relative">
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSubmit()}
            placeholder="Da (es. Roma FCO)"
            className={inputStyle}
            autoComplete="off"
            aria-label="Aeroporto di partenza"
          />
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSubmit()}
            placeholder="A (es. New York JFK)"
            className={inputStyle}
            autoComplete="off"
            aria-label="Aeroporto di arrivo"
          />
          <DatePicker
            selected={startDate}
            onChange={onStartDate}
            placeholderText="Partenza"
            minDate={new Date()}
            className={inputStyle}
          />
          <DatePicker
            selected={endDate}
            onChange={onEndDate}
            placeholderText="Ritorno (opzionale)"
            minDate={startDate || new Date()}
            className={inputStyle}
          />
          <button
            onClick={swapFlight}
            className="absolute right-3 -top-5 bg-gray-200 dark:bg-gray-700 p-1 rounded-md"
            title="Inverti"
            aria-label="Inverti partenza e arrivo"
          >
            ⇄
          </button>
        </div>
      )}

      {/* Hotel/BnB */}
      {(mode === "hotel" || mode === "bnb") && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSubmit()}
            placeholder="Dove (es. Firenze Duomo)"
            className={inputStyle}
            autoComplete="off"
            aria-label="Destinazione"
          />
          <DatePicker
            selected={startDate}
            onChange={onStartDate}
            placeholderText="Check-in"
            minDate={new Date()}
            className={inputStyle}
          />
          <DatePicker
            selected={endDate}
            onChange={onEndDate}
            placeholderText="Check-out"
            minDate={startDate || new Date()}
            className={inputStyle}
          />
        </div>
      )}

      {/* Car */}
      {mode === "car" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSubmit()}
            placeholder="Punto ritiro"
            className={inputStyle}
            autoComplete="off"
            aria-label="Punto di ritiro auto"
          />
          <DatePicker
            selected={startDate}
            onChange={onStartDate}
            placeholderText="Data ritiro"
            minDate={new Date()}
            className={inputStyle}
          />
          <DatePicker
            selected={endDate}
            onChange={onEndDate}
            placeholderText="Data riconsegna"
            minDate={startDate || new Date()}
            className={inputStyle}
          />
        </div>
      )}

      {/* Bottone cerca */}
      <div className="mt-3 flex items-center justify-between">
        {mode === "general" && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Tip: premi <kbd className="px-1 rounded bg-gray-100 dark:bg-gray-800">Tab</kbd> per auto-completare
          </span>
        )}
        <button
          onClick={doSubmit}
          className="ml-auto px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Cerca →
        </button>
      </div>
    </div>
  );
}

/* --- UI helpers --- */
function IconBtn({ children, title, onClick, className = "" }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`px-2 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
    >
      {children}
    </button>
  );
}

function RowInfo({ text }: { text: string }) {
  return <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{text}</div>;
}

function iconFor(type?: string) {
  switch (type) {
    case "airport":
      return "🛫";
    case "city":
      return "🏙️";
    case "hotel":
      return "🏨";
    case "car":
      return "🚗";
    case "train":
      return "🚆";
    default:
      return "📍";
  }
}

/* --- Utils --- */
function normalizeArray(arr: any[]) {
  return (arr || [])
    .map((x) => {
      if (typeof x === "string") return { key: slug(x), name: x };
      const key = x.key ?? slug(x.name ?? JSON.stringify(x));
      return { ...x, key };
    })
    .filter(Boolean);
}

function flattenSections(sections: any[]) {
  const out: any[] = [];
  for (const s of sections) {
    if (!s.items?.length) continue;
    out.push({ __type: "header", key: s.key, title: s.title });
    for (const it of s.items) out.push({ __type: "item", item: it });
  }
  return out;
}

function firstRowIndex(flat: any[]) {
  if (!flat?.length) return -1;
  const idx = flat.findIndex((r) => r.__type === "item");
  return idx === -1 ? -1 : idx;
}

function validHint(val: string, hint: string) {
  if (!val || !hint) return false;
  return hint.toLowerCase().startsWith(val.toLowerCase()) && hint.toLowerCase() !== val.toLowerCase();
}

function bestHint(items: Item[], q: string) {
  if (!q) return "";
  const x = items.find((i) => i.name?.toLowerCase().startsWith(q.toLowerCase()));
  return x?.name || "";
}

function bestHintFromSections(sections: any[], q: string) {
  for (const s of sections) {
    const h = bestHint(s.items || [], q);
    if (h) return h;
  }
  return "";
}

function highlightText(text: string, q: string) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <span>
      {text.slice(0, i)}
      <mark className="bg-yellow-200 dark:bg-yellow-600">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </span>
  );
}

function guessType(item: Item, mode: string) {
  if (item.code && item.code.length === 3 && item.code.toUpperCase() === item.code) return "airport";
  if (mode === "car") return "car";
  if (mode === "hotel" || mode === "bnb") return "hotel";
  return "city";
}

function slug(s: string) {
  return (s || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ======= LRU cache ======= */
function LRUCache(limit = 100, ttl = 300000) {
  this.map = new Map();
  this.limit = limit;
  this.ttl = ttl;
}
LRUCache.prototype.get = function (k: string) {
  const v = this.map.get(k);
  if (!v) return undefined;
  if (v.exp < Date.now()) {
    this.map.delete(k);
    return undefined;
  }
  this.map.delete(k);
  this.map.set(k, v);
  return v.val;
};
LRUCache.prototype.has = function (k: string) {
  return this.get(k) !== undefined;
};
LRUCache.prototype.set = function (k: string, val: any) {
  const exp = Date.now() + this.ttl;
  if (this.map.has(k)) this.map.delete(k);
  this.map.set(k, { val, exp });
  if (this.map.size > this.limit) {
    this.map.delete(this.map.keys().next().value);
  }
};

/* ======= History ======= */
function loadHistory(storageKey: string, seed = []) {
  if (typeof window === "undefined") return normalizeArray(seed);
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return normalizeArray(seed);
    return normalizeArray(JSON.parse(raw));
  } catch {
    return normalizeArray(seed);
  }
}

function saveHistory(storageKey: string, historyRef: any, name: string, max = 12) {
  const item = typeof name === "string" ? { name } : name;
  const current = normalizeArray(historyRef.current);
  const dedup = [item, ...current].reduce((acc: any[], it: any) => {
    if (acc.find((x) => x.name.toLowerCase() === it.name.toLowerCase())) return acc;
    acc.push(it);
    return acc;
  }, []);
  const clipped = dedup.slice(0, max);
  historyRef.current = clipped;
  try {
    localStorage.setItem(storageKey, JSON.stringify(clipped));
  } catch {}
}

/* ======= Fuzzy filter ======= */
function fuzzyFilterSections(sections: any[], q: string) {
  if (!q) return sections;
  const QQ = q.toLowerCase();
  const score = (name: string) => {
    const s = (name || "").toLowerCase();
    let i = 0, j = 0, hits = 0;
    while (i < QQ.length && j < s.length) {
      if (QQ[i] === s[j]) { hits++; i++; }
      j++;
    }
    const pref = s.startsWith(QQ) ? 100 : 0;
    return pref + hits - Math.max(0, s.length - QQ.length) * 0.01;
  };
  return sections
    .map((sec) => {
      const items = (sec.items || [])
        .map((it: Item) => ({ it, sc: score(it.name || "") }))
        .filter((x) => x.sc > 0)
        .sort((a, b) => b.sc - a.sc)
        .map((x) => x.it)
        .slice(0, 20);
      return { ...sec, items };
    })
    .filter((s) => s.items.length);
}

/* ======= Key handling ======= */
function handleKeyDown(
  e: React.KeyboardEvent,
  flat: any[],
  hi: number,
  setHi: (i: number) => void,
  pick: (item: Item) => void,
  doSubmit: () => void,
  val: string,
  hint: string,
  setVal: (v: string) => void,
  setOpen: (v: boolean) => void
) {
  if (!flat?.length && e.key === "Enter") {
    e.preventDefault();
    if (validHint(val, hint)) setVal(hint);
    else doSubmit();
    return;
  }

  if (e.key === "ArrowDown" && flat?.length) {
    e.preventDefault();
    const i = nextSelectable(flat, hi);
    setHi(i);
  } else if (e.key === "ArrowUp" && flat?.length) {
    e.preventDefault();
    const i = prevSelectable(flat, hi);
    setHi(i);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (hi >= 0 && flat?.[hi]?.item) pick(flat[hi].item);
    else if (validHint(val, hint)) setVal(hint);
    else doSubmit();
  } else if (e.key === "Escape") {
    setOpen(false);
  } else if (e.key === "Tab") {
    if (!e.shiftKey && validHint(val, hint)) {
      setVal(hint);
      e.preventDefault();
    }
  }
}

function nextSelectable(flat: any[], h: number) {
  if (!flat?.length) return -1;
  let i = h;
  for (let step = 0; step < flat.length; step++) {
    i = (i + 1) % flat.length;
    if (flat[i].__type === "item") return i;
  }
  return -1;
}

function prevSelectable(flat: any[], h: number) {
  if (!flat?.length) return -1;
  let i = h;
  for (let step = 0; step < flat.length; step++) {
    i = (i - 1 + flat.length) % flat.length;
    if (flat[i].__type === "item") return i;
  }
  return -1;
}
/* ======= Extra Potenziamenti ======= */

/**
 * 🔍 Debug log controllato
 * Abilitalo con localStorage.setItem("vrabo.debug", "1")
 */
function debugLog(...args: any[]) {
  if (typeof window !== "undefined" && localStorage.getItem("vrabo.debug") === "1") {
    console.debug("[VRABO SearchBar]", ...args);
  }
}

/**
 * 📈 Tracking eventi per analytics / affiliate
 * Usa un pixel invisibile o un event push su GTM
 */
function trackEvent(event: string, payload: Record<string, any> = {}) {
  debugLog("trackEvent", event, payload);

  // esempio: push su dataLayer
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event,
      ...payload,
    });
  }

  // esempio: pixel invisibile
  const img = new Image();
  img.src =
    `/api/track?e=${encodeURIComponent(event)}&d=${encodeURIComponent(
      JSON.stringify(payload)
    )}&ts=${Date.now()}`;
}

/**
 * 🎯 Costruzione link affiliate (Travelpayouts / Booking / etc.)
 * Sostituisce query dirette con URL contenenti ID di affiliazione.
 */
function buildAffiliateUrl(item: Item, type: string) {
  const base = "https://tp.media/r?marker=YOUR_MARKER&locale=it&currency=eur";

  if (type === "flight" && item.code) {
    return `${base}&q=flights&origin=${item.code}`;
  }
  if (type === "hotel" || type === "bnb") {
    return `${base}&q=hotels&destination=${encodeURIComponent(item.name)}`;
  }
  if (type === "car") {
    return `${base}&q=cars&pickup=${encodeURIComponent(item.name)}`;
  }
  // fallback generico
  return `${base}&q=search&term=${encodeURIComponent(item.name)}`;
}

/**
 * 🪄 Hook opzionale: puoi agganciare callback esterne
 * es. log custom, API interne, ecc.
 */
function useExternalHooks(onPick?: (item: Item) => void, onSubmit?: (payload: any) => void) {
  return {
    handlePick: (item: Item) => {
      trackEvent("search_pick", { name: item.name, code: item.code });
      const url = buildAffiliateUrl(item, item.type || "general");
      debugLog("Affiliate URL", url);
      onPick?.(item);
    },
    handleSubmit: (payload: any) => {
      trackEvent("search_submit", payload);
      debugLog("Submit payload", payload);
      onSubmit?.(payload);
    },
  };
}

/* ======= Fallback locale esteso ======= */
const LOCAL_FALLBACK: Item[] = [
  { key: "barcellona", name: "Barcellona", type: "city", country: "Spagna" },
  { key: "berlino", name: "Berlino", type: "city", country: "Germania" },
  { key: "amsterdam", name: "Amsterdam", type: "city", country: "Paesi Bassi" },
  { key: "lisbona", name: "Lisbona", type: "city", country: "Portogallo" },
  { key: "newyork", name: "New York", type: "city", country: "USA" },
  { key: "losangeles", name: "Los Angeles", type: "city", country: "USA" },
  { key: "dubai", name: "Dubai", type: "city", country: "EAU" },
  { key: "bangkok", name: "Bangkok", type: "city", country: "Thailandia" },
  { key: "sydney", name: "Sydney", type: "city", country: "Australia" },
  { key: "cittadelcapo", name: "Città del Capo", type: "city", country: "Sudafrica" },
];

/* ======= Estensione della SearchBar con fallback ======= */
function withLocalFallback(suggestions: Item[], limit = 30): Item[] {
  const merged = [...suggestions];
  for (const city of LOCAL_FALLBACK) {
    if (!merged.find((x) => x.name.toLowerCase() === city.name.toLowerCase())) {
      merged.push(city);
    }
  }
  return merged.slice(0, limit);
}
