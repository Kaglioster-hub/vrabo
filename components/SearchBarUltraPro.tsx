"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
} from "react";
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

/* ======= LRU cache ======= */
class LRUCache<T = any> {
  private map = new Map<string, { val: T; exp: number }>();
  constructor(private limit = 100, private ttl = 300000) {}
  get(k: string): T | undefined {
    const v = this.map.get(k);
    if (!v) return undefined;
    if (v.exp < Date.now()) {
      this.map.delete(k);
      return undefined;
    }
    this.map.delete(k);
    this.map.set(k, v);
    return v.val;
  }
  has(k: string) {
    return this.get(k) !== undefined;
  }
  set(k: string, val: T) {
    const exp = Date.now() + this.ttl;
    if (this.map.has(k)) this.map.delete(k);
    this.map.set(k, { val, exp });
    if (this.map.size > this.limit) {
      const first = this.map.keys().next().value as string | undefined;
      if (first) this.map.delete(first);
    }
  }
}

/* ---------- Componente ---------- */
const SearchBarUltraPro: React.FC<SearchBarUltraProProps> = ({
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
  minChars = 1,
  maxResults = 50,
  preloadOnFocus = true,
  enableVoice = true,
  hotkeys = true,
  storageKey = "vrabo.search.recent",
  historyMax = 12,
  onError,
}) => {
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const cacheRef = useRef(new LRUCache<any[]>(200, 300000));
  const inflightRef = useRef(new Map());
  const seqRef = useRef(0);
  const historyRef = useRef(loadHistory(storageKey, recent));

  const uid = useId();
  const listboxId = `sb-ultra-listbox-${uid}`;
  const activeId = hi >= 0 ? `${listboxId}-row-${hi}` : undefined;

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

  /* ---------- Render ---------- */
  return (
    <div className={`relative w-full p-4 rounded-xl shadow-lg bg-white dark:bg-gray-900 ${className}`}>
      {mode === "general" && (
        <GeneralInput
          inputRef={inputRef}
          val={val}
          setVal={setVal}
          hint={hint}
          open={open}
          flat={flat}
          hi={hi}
          setHi={setHi}
          pick={pick}
          doSubmit={doSubmit}
          listboxId={listboxId}
          activeId={activeId}
          listRef={listRef}
          showClear={!!val}
          errMsg={errMsg}
          loading={loading}
          ph={placeholder}
        />
      )}
      {/* … flight/hotel/car UI come già scritto sopra … */}
    </div>
  );
};

export default SearchBarUltraPro;

/* ---------- Helpers ---------- */
function GeneralInput(props: any) {
  // stesso codice che hai già: input, hint, dropdown, etc.
  return <div>…</div>;
}

/* ---------- Helpers ---------- */
function GeneralInput(props: any) {
  const {
    inputRef,
    val,
    setVal,
    hint,
    open,
    flat,
    hi,
    setHi,
    pick,
    doSubmit,
    inputStyle,
    listboxId,
    activeId,
    boxRef,
    listRef,
    enableVoice,
    onVoice,
    showClear,
    setHint,
    setOpen,
    errMsg,
    loading,
    ph,
  } = props;
  return (
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
          if (!val.trim()) setOpen(flat.length > 0);
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
              const icon = iconFor(item.type);
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
  );
}

function IconBtn({ children, title, onClick, className = "" }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`px-2 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 
        dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 
        focus:ring-blue-400 ${className}`}
    >
      {children}
    </button>
  );
}
function RowInfo({ text }: { text: string }) {
  return (
    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
      {text}
    </div>
  );
}
function iconFor(type?: string) {
  switch (type) {
    case "airport": return "🛫";
    case "city": return "🏙️";
    case "hotel": return "🏨";
    case "car": return "🚗";
    default: return "📍";
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
      <mark className="bg-yellow-200 dark:bg-yellow-600">
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </span>
  );
}
function slug(s: string) {
  return (s || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
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
