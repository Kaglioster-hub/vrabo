"use client";
import { useEffect, useMemo, useRef, useState, useId } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * SearchBarUltraPro — MEGA UNIFICATA EDITION ⚡
 * --------------------------------------------
 * - Modalità dinamiche: general, flight, hotel/bnb, car
 * - Suggerimenti con cache/fuzzy
 * - ARIA combobox + aria-live
 * - Ghost hint + Tab completion
 * - Hotkeys (/ Cmd+K), Voice input, Swap voli
 * - Recent/Popular/Pinned con localStorage
 * - Responsive grid con controlli multipli
 * - Sicura, accessibile, performante
 */

export default function SearchBarUltraPro({
  mode = "general",
  value,
  onChange,
  onSubmit,
  onPick,
  recent = [],
  popular = [],
  pinned = [],
  placeholder = "Cerca destinazione o servizio…",
  className = "",
  suggestUrl = "/api/suggest",
  debounceMs = 250,
  minChars = 2,
  maxResults = 50,
  preloadOnFocus = true,
  enableVoice = true,
  hotkeys = true,
  storageKey = "vrabo.search.recent",
  historyMax = 12,
  onError,
}) {
  // ============= STATE =============
  const [inner, setInner] = useState("");
  const val = (value ?? inner).toString();
  const setVal = (v) => (onChange ? onChange(v) : setInner(v));

  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const [flat, setFlat] = useState([]);
  const [hi, setHi] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState("");
  const [errMsg, setErrMsg] = useState("");

  // Multi-field states (flight/hotel/car)
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dest, setDest] = useState("");
  const [pickup, setPickup] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // ============= REFS =============
  const abortRef = useRef(null);
  const debRef = useRef(null);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const cacheRef = useRef(new LRUCache(200, 300000)); // 5 min TTL
  const inflightRef = useRef(new Map());
  const seqRef = useRef(0);
  const historyRef = useRef(loadHistory(storageKey, recent));

  const uid = useId();
  const listboxId = `sb-ultra-listbox-${uid}`;
  const activeId = hi >= 0 ? `${listboxId}-row-${hi}` : undefined;

  // ============= PLACEHOLDER dinamico =============
  const ph = useMemo(() => {
    if (mode === "flight") return "Da/Per (es. Roma FCO → JFK)";
    if (mode === "car") return "Punto ritiro auto";
    if (mode === "bnb" || mode === "hotel") return "Città/Hotel (es. Firenze – Duomo)";
    return placeholder;
  }, [mode, placeholder]);

  // ============= HOTKEYS globali =============
  useEffect(() => {
    if (!hotkeys) return;
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      const texty = tag === "input" || tag === "textarea" || e.target?.isContentEditable;
      if (!texty && (e.key === "/" || (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)))) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, hotkeys]);

  // ============= Cleanup =============
  useEffect(() => {
    return () => {
      clearTimeout(debRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // ============= Click esterno chiude =============
  useEffect(() => {
    function onDoc(e) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // ============= Static sections (recent/popular/pinned) =============
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
    setSections(secs);
    setFlat(flattenSections(secs));
    setHint("");
    setHi(-1);
    setOpen(secs.some((s) => s.items.length > 0));
  };

  // ============= FETCH Suggest =============
  useEffect(() => {
    if (mode !== "general") return; // Suggerimenti solo per campo general
    if (!val.trim()) {
      setErrMsg("");
      setHint("");
      setHi(-1);
      if (preloadOnFocus && document.activeElement === inputRef.current) openStaticIfAny();
      else { setSections([]); setFlat([]); setOpen(false); }
      return;
    }
    if (val.trim().length < minChars) {
      const secs = buildStaticSections();
      const filtered = fuzzyFilterSections(secs, val);
      setSections(filtered);
      setFlat(flattenSections(filtered));
      setHint(bestHintFromSections(filtered, val));
      setHi(-1);
      setOpen(filtered.some((s) => s.items.length));
      return;
    }
    clearTimeout(debRef.current);
    debRef.current = setTimeout(async () => {
      const q = val.trim();
      const key = `${suggestUrl}|${mode}|${q}|${maxResults}`;
      const seq = ++seqRef.current;
      if (cacheRef.current.has(key)) {
        applySuggestions(q, cacheRef.current.get(key), seq);
        return;
      }
      if (inflightRef.current.has(key)) {
        try { const sug = await inflightRef.current.get(key); if (seqRef.current === seq) applySuggestions(q, sug, seq); } catch {}
        return;
      }
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      setLoading(true); setErrMsg("");
      const p = (async () => {
        const url = `${suggestUrl}?q=${encodeURIComponent(q)}&mode=${mode}&limit=${maxResults}`;
        const r = await fetch(url, { signal: abortRef.current.signal });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        return Array.isArray(j?.suggestions) ? j.suggestions : [];
      })();
      inflightRef.current.set(key, p);
      try {
        const suggestions = await p;
        cacheRef.current.set(key, suggestions);
        if (seqRef.current === seq) applySuggestions(q, suggestions, seq);
      } catch (err) {
        if (err?.name !== "AbortError") {
          const secs = fuzzyFilterSections(buildStaticSections(), q);
          setSections(secs); setFlat(flattenSections(secs));
          setHint(bestHintFromSections(secs, q)); setHi(-1);
          setOpen(secs.some((s) => s.items.length));
          setErrMsg("⚠️ Connessione lenta, fallback locale.");
          onError?.(err);
        }
      } finally {
        inflightRef.current.delete(key);
        setLoading(false);
      }
    }, debounceMs);
    return () => clearTimeout(debRef.current);
  }, [val, mode, minChars, maxResults, suggestUrl, debounceMs, preloadOnFocus]);

  function applySuggestions(q, suggestions, seq) {
    if (seq !== seqRef.current) return;
    const normalized = normalizeArray(suggestions).slice(0, maxResults);
    const secs = [
      ...(pinned?.length ? [{ key: "pinned", title: "Consigliati", items: normalizeArray(pinned) }] : []),
      { key: "suggested", title: "Suggeriti", items: normalized },
      ...(historyRef.current?.length ? [{ key: "recent", title: "Recenti", items: normalizeArray(historyRef.current) }] : []),
    ];
    setSections(secs); setFlat(flattenSections(secs));
    setHint(bestHint(normalized, q));
    setHi(normalized.length ? firstRowIndex(flattenSections(secs)) : -1);
    setOpen(secs.some((s) => s.items.length));
    setErrMsg("");
  }

  // ============= Submit handler =============
  const doSubmit = () => {
    let payload = {};
    if (mode === "flight") payload = { from, to, depart: startDate, return: endDate };
    else if (mode === "hotel" || mode === "bnb") payload = { dest, checkin: startDate, checkout: endDate };
    else if (mode === "car") payload = { pickup, from: startDate, to: endDate };
    else payload = { query: val };

    saveHistory(storageKey, historyRef, val, historyMax);
    onSubmit?.(payload);
    setOpen(false);
  };

  const pick = (item) => {
    const name = item?.name ?? "";
    if (!name) return;
    setVal(name);
    setOpen(false);
    setHint("");
    saveHistory(storageKey, historyRef, name, historyMax);
    onPick?.(item);
    onSubmit?.(name);
  };

  const swapFlight = () => {
    if (mode !== "flight") return;
    setFrom(to);
    setTo(from);
  };

  const onVoice = () => {
    if (!enableVoice) return;
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) return;
    try {
      const rec = new SR();
      rec.lang = "it-IT";
      rec.onresult = (ev) => {
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

  // ============= RENDER =============
  return (
    <div className={`relative w-full p-4 rounded-xl shadow-lg bg-white dark:bg-gray-900 ${className}`} ref={boxRef}>
      {/* --- MODE: general con suggerimenti --- */}
      {mode === "general" && (
        <>
          <div className="relative">
            {/* Ghost hint */}
            <div className="absolute inset-y-0 left-4 right-28 flex items-center pointer-events-none z-0">
              <span className="truncate text-gray-400 select-none">
                <span className="invisible">{val}</span>
                <span className="opacity-40">{validHint(val, hint) ? hint.slice(val.length) : ""}</span>
              </span>
            </div>

            {/* Input principale */}
            <input
              ref={inputRef}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onFocus={() => { if (!val.trim() && preloadOnFocus) openStaticIfAny(); else setOpen(flat.length > 0); }}
              onBlur={() => { requestAnimationFrame(() => { if (!boxRef.current?.contains(document.activeElement)) setOpen(false); }); }}
              onKeyDown={(e) => handleKeyDown(e, flat, hi, setHi, pick, doSubmit, val, hint, setVal, setOpen)}
              placeholder={ph}
              autoComplete="off"
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-activedescendant={activeId}
              aria-autocomplete="list"
              className="w-full pr-28 pl-4 py-3 rounded-lg border shadow-sm bg-white text-black dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none relative z-10"
            />

            {/* Controls */}
            <div className="absolute inset-y-0 right-2 flex items-center gap-1 z-20">
              {enableVoice && <IconBtn title="Dettatura vocale" onClick={onVoice}>🎤</IconBtn>}
              {showClear && <IconBtn title="Pulisci" onClick={() => { setVal(""); setHint(""); setOpen(false); setHi(-1); inputRef.current?.focus(); }}>⨯</IconBtn>}
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
                {!loading && !flat.some((r) => r.__type === "item") && <RowInfo text={errMsg || "Nessun risultato"} />}

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
                    const item = row.item;
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
                        className={`px-4 py-2 cursor-pointer flex items-center gap-2 ${active ? "bg-blue-50 dark:bg-gray-700" : ""}`}
                      >
                        <span className="shrink-0">{icon}</span>
                        <div className="min-w-0">
                          <div className="truncate">{highlightText(item.name, val)}</div>
                          {subtitle && <div className="text-xs text-gray-500 truncate">{subtitle}</div>}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </>
      )}

      {/* --- MODE: flight --- */}
      {mode === "flight" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 relative">
          <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Da (es. Roma FCO)" className="input" />
          <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="A (es. New York JFK)" className="input" />
          <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Partenza" minDate={new Date()} className="input" />
          <DatePicker selected={endDate} onChange={setEndDate} placeholderText="Ritorno (opzionale)" minDate={startDate || new Date()} className="input" />
          <button onClick={swapFlight} className="absolute right-3 -top-5 bg-gray-200 dark:bg-gray-700 p-1 rounded-md" title="Inverti">⇄</button>
        </div>
      )}

      {/* --- MODE: hotel/bnb --- */}
      {(mode === "hotel" || mode === "bnb") && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input value={dest} onChange={(e) => setDest(e.target.value)} placeholder="Dove (es. Firenze Duomo)" className="input" />
          <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Check-in" minDate={new Date()} className="input" />
          <DatePicker selected={endDate} onChange={setEndDate} placeholderText="Check-out" minDate={startDate || new Date()} className="input" />
        </div>
      )}

      {/* --- MODE: car --- */}
      {mode === "car" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Punto ritiro" className="input" />
          <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Data ritiro" minDate={new Date()} className="input" />
          <DatePicker selected={endDate} onChange={setEndDate} placeholderText="Data riconsegna" minDate={startDate || new Date()} className="input" />
        </div>
      )}

      {/* --- Bottone cerca --- */}
      <div className="mt-3 flex justify-end">
        <button onClick={doSubmit} className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">Cerca →</button>
      </div>
    </div>
  );
}

/* --- UI helpers --- */
function IconBtn({ children, title, onClick, className = "" }) {
  return (
    <button type="button" title={title} onClick={onClick}
      className={`px-2 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 ${className}`}>
      {children}
    </button>
  );
}
function RowInfo({ text }) {
  return <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{text}</div>;
}
function iconFor(type) {
  switch (type) {
    case "airport": return "🛫";
    case "city": return "🏙️";
    case "hotel": return "🏨";
    case "car": return "🚗";
    case "train": return "🚆";
    default: return "📍";
  }
}

/* --- Helpers --- */
function normalizeArray(arr) {
  return (arr || [])
    .map((x) => {
      if (typeof x === "string") return { key: slug(x), name: x };
      const key = x.key ?? slug(x.name ?? JSON.stringify(x));
      return { ...x, key };
    })
    .filter(Boolean);
}
function flattenSections(sections) {
  const out = [];
  for (const s of sections) {
    if (!s.items?.length) continue;
    out.push({ __type: "header", key: s.key, title: s.title });
    for (const it of s.items) out.push({ __type: "item", item: it });
  }
  return out;
}
function firstRowIndex(flat) {
  return flat.findIndex((r) => r.__type === "item");
}
function validHint(val, hint) {
  if (!val || !hint) return false;
  return (
    hint.toLowerCase().startsWith(val.toLowerCase()) &&
    hint.toLowerCase() !== val.toLowerCase()
  );
}
function bestHint(items, q) {
  if (!q) return "";
  const x = items.find((i) => i.name?.toLowerCase().startsWith(q.toLowerCase()));
  return x?.name || "";
}
function bestHintFromSections(sections, q) {
  for (const s of sections) {
    const h = bestHint(s.items || [], q);
    if (h) return h;
  }
  return "";
}
function highlightText(text, q) {
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
function guessType(item, mode) {
  if (item.code && item.code.length === 3 && item.code.toUpperCase() === item.code)
    return "airport";
  if (mode === "car") return "car";
  if (mode === "hotel" || mode === "bnb") return "hotel";
  return "city";
}
function slug(s) {
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
LRUCache.prototype.get = function (k) {
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
LRUCache.prototype.has = function (k) {
  return this.get(k) !== undefined;
};
LRUCache.prototype.set = function (k, val) {
  const exp = Date.now() + this.ttl;
  if (this.map.has(k)) this.map.delete(k);
  this.map.set(k, { val, exp });
  if (this.map.size > this.limit) {
    this.map.delete(this.map.keys().next().value);
  }
};

/* ======= History ======= */
function loadHistory(storageKey, seed = []) {
  if (typeof window === "undefined") return normalizeArray(seed);
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return normalizeArray(seed);
    return normalizeArray(JSON.parse(raw));
  } catch {
    return normalizeArray(seed);
  }
}
function saveHistory(storageKey, historyRef, name, max = 12) {
  const item = typeof name === "string" ? { name } : name;
  const current = normalizeArray(historyRef.current);
  const dedup = [item, ...current].reduce((acc, it) => {
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
function fuzzyFilterSections(sections, q) {
  if (!q) return sections;
  const QQ = q.toLowerCase();
  const score = (name) => {
    const s = name.toLowerCase();
    let i = 0, j = 0, hits = 0;
    while (i < QQ.length && j < s.length) {
      if (QQ[i] === s[j]) { hits++; i++; }
      j++;
    }
    const pref = s.startsWith(QQ) ? 100 : 0;
    return pref + hits - (s.length - QQ.length) * 0.01;
  };
  return sections
    .map((sec) => {
      const items = (sec.items || [])
        .map((it) => ({ it, sc: score(it.name || "") }))
        .filter((x) => x.sc > 0)
        .sort((a, b) => b.sc - a.sc)
        .map((x) => x.it)
        .slice(0, 20);
      return { ...sec, items };
    })
    .filter((s) => s.items.length);
}

/* ======= Key handling ======= */
function handleKeyDown(e, flat, hi, setHi, pick, doSubmit, val, hint, setVal, setOpen) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    const i = nextSelectable(flat, hi);
    setHi(i);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const i = prevSelectable(flat, hi);
    setHi(i);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (hi >= 0) pick(flat[hi].item);
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
function nextSelectable(flat, h) {
  let i = h;
  do { i = (i + 1) % flat.length; } while (flat[i].__type !== "item");
  return i;
}
function prevSelectable(flat, h) {
  let i = h;
  do { i = (i - 1 + flat.length) % flat.length; } while (flat[i].__type !== "item");
  return i;
}

/* ======= Styling helper (Tailwind apply) ======= */
const inputStyle =
  "w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none";
