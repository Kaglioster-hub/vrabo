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
        {enableVoice && (
          <IconBtn title="Dettatura vocale" onClick={onVoice}>
            🎤
          </IconBtn>
        )}
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
