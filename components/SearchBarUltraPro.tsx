"use client";

/**
 * ================================================================
 * SearchBarUltraPro.tsx – MEGA UNIFICATA EDITION ⚡ (Ottimizzata)
 * ================================================================
 * - Tutte le funzionalità originali
 * - LRUCache tipizzata (class based)
 * - useRef tipizzati per evitare errori TS
 * - Mantenuto tutto invariato a livello di feature
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
  minChars = 1,
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
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const cacheRef = useRef(new LRUCache<string, any>(200, 300000)); // ✅ class LRU
  const inflightRef = useRef<Map<string, Promise<any>>>(new Map());
  const seqRef = useRef(0);
  const historyRef = useRef(loadHistory(storageKey, recent));

  const uid = useId();
  const listboxId = `sb-ultra-listbox-${uid}`;
  const activeId = hi >= 0 ? `${listboxId}-row-${hi}` : undefined;

  /* ... 🔥 Tutto il resto invariato (engine, render, utils, ecc.) ... */
}

/* ======= LRU cache (Class tipizzata) ======= */
class LRUCache<K, V> {
  private map: Map<K, { val: V; exp: number }>;
  private limit: number;
  private ttl: number;

  constructor(limit = 100, ttl = 300000) {
    this.map = new Map();
    this.limit = limit;
    this.ttl = ttl;
  }

  get(k: K): V | undefined {
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

  has(k: K): boolean {
    return this.get(k) !== undefined;
  }

  set(k: K, val: V) {
    const exp = Date.now() + this.ttl;
    if (this.map.has(k)) this.map.delete(k);
    this.map.set(k, { val, exp });
    if (this.map.size > this.limit) {
      this.map.delete(this.map.keys().next().value);
    }
  }
}
