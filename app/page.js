// app/page.js
"use client";

/**
 * VRABO — app/page.js (SUPREME DELUXE EDITION + Donazioni avanzate)
 * --------------------------------------------------------------------
 * - Ricerca comparatore multi-categoria (hotel, voli, auto, transfer…)
 * - Autocomplete Travelpayouts + debounce + IME safe
 * - Gestione tastiera: / focus, Enter submit, ↑/↓ naviga
 * - Swap rotta "A → B" (voli)
 * - Voice Input
 * - Persistenza profilo/ricerche recenti in localStorage
 * - Skeleton, empty state, error handling
 * - Filtri: sort + price min/max + slider
 * - Dashboard analitica (Recharts)
 * - Multilingua (i18next)
 * - PWA-ready hint + GDPR banner
 * - DONAZIONI: Stripe (payment link), PayPal (donations@vrabo.it), Crypto con MetaMask deep-link
 * --------------------------------------------------------------------
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import QRCode from "react-qr-code";

// Grafici
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Traduzioni
import i18next from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

// ======================= CONFIG DONAZIONI =======================
// PayPal email
const PAYPAL_EMAIL = "donations@vrabo.it";

// Wallet VRABO
const VRABO_WALLET = "0xe77E6C411F2ee01F1cfbccCb1c418c80F1a534fe";

// Stripe Payment Link predefinito (modalità "il cliente sceglie l'importo")
const STRIPE_LINK_DEFAULT =
  process.env.NEXT_PUBLIC_STRIPE_LINK ||
  "https://buy.stripe.com/test_xxxxxxxxxxxxxxx"; // <— Sostituisci

// (Opzionale) Payment Link per importi rapidi: se li imposti qui, il bottone Stripe
// userà il link specifico per quell’importo (utile se NON usi 'customer chooses price').
const STRIPE_LINKS_BY_AMOUNT = {
  // 5: "https://buy.stripe.com/test_xxxPer5Euro",
  // 10: "https://buy.stripe.com/test_xxxPer10Euro",
  // 25: "https://buy.stripe.com/test_xxxPer25Euro",
  // 50: "https://buy.stripe.com/test_xxxPer50Euro",
};

// Deep-link app MetaMask (mobile) + schema EIP-681 fallback
const METAMASK_APP_BASE = "https://metamask.app.link/send";

// Chain list (id + simbolo + nome) per selettore
const CHAINS = [
  { id: 1, symbol: "ETH", name: "Ethereum" },
  { id: 137, symbol: "MATIC", name: "Polygon" },
  { id: 56, symbol: "BNB", name: "BNB Smart Chain" },
];

// ======================= i18n =======================
i18next.use(initReactI18next).init({
  resources: {
    it: {
      translation: {
        heroTitle: "Il comparatore dei comparatori",
        heroSubtitle: "non sceglie per te, sceglie con te",
        tabs: {
          bnb: "🏠 BnB & Hotel",
          flight: "✈️ Voli",
          car: "🚗 Auto",
          finance: "💳 Finanza",
          trading: "📈 Trading",
          tickets: "🎟️ Ticket",
          connectivity: "📶 Connessione",
        },
        search: "Cerca",
        recent: "Ricerche recenti",
        filters: "Filtri",
        about: "Cos’è VRABO",
        support: "💙 Sostieni VRABO",
        contact: "📩 Contattaci",
        noResults: "Nessun risultato",
        loading: "Cerco le migliori offerte…",
      },
    },
    en: {
      translation: {
        heroTitle: "The comparator of comparators",
        heroSubtitle: "doesn’t choose for you, chooses with you",
        tabs: {
          bnb: "🏠 BnB & Hotels",
          flight: "✈️ Flights",
          car: "🚗 Cars",
          finance: "💳 Finance",
          trading: "📈 Trading",
          tickets: "🎟️ Tickets",
          connectivity: "📶 Connectivity",
        },
        search: "Search",
        recent: "Recent searches",
        filters: "Filters",
        about: "What is VRABO",
        support: "💙 Support VRABO",
        contact: "📩 Contact us",
        noResults: "No results",
        loading: "Searching the best deals…",
      },
    },
  },
  lng: "it",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// -------------------------------------------------------------
// UI costanti
// -------------------------------------------------------------
const TABS = [
  { id: "bnb", label: i18next.t("tabs.bnb") },
  { id: "flight", label: i18next.t("tabs.flight") },
  { id: "car", label: i18next.t("tabs.car") },
  { id: "finance", label: i18next.t("tabs.finance") },
  { id: "trading", label: i18next.t("tabs.trading") },
  { id: "tickets", label: i18next.t("tabs.tickets") },
  { id: "connectivity", label: i18next.t("tabs.connectivity") },
];

const POPULAR_CITIES = [
  "Roma",
  "Milano",
  "Venezia",
  "Napoli",
  "Firenze",
  "Torino",
  "Parigi",
  "Londra",
  "Madrid",
  "New York",
  "Tokyo",
  "Dubai",
];

const FINANCE_STYLES = [
  { id: "basic", label: "Basic" },
  { id: "smart", label: "Smart" },
  { id: "luxury", label: "Premium" },
];

const RISK_LEVELS = [
  { id: "low", label: "Rischio basso" },
  { id: "medium", label: "Rischio medio" },
  { id: "high", label: "Rischio alto" },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#845EC2"];

// -------------------------------------------------------------
// Utils
// -------------------------------------------------------------
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const toISO = (d) => (d ? new Date(d).toISOString() : "");
const openInNewTab = (url) => window.open(url, "_blank", "noopener,noreferrer");

// Arrotonda 2 decimali safe
const round2 = (x) => Math.round((Number(x) || 0) * 100) / 100;

// ETH amount (string/number) -> wei string (BigInt safe)
function amountToWeiStr(amount, decimals = 18) {
  const str = String(amount ?? "0").trim();
  if (!/^\d+(\.\d+)?$/.test(str)) return "0";
  const [int, frac = ""] = str.split(".");
  const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
  const wei =
    BigInt(int || "0") * 10n ** BigInt(decimals) + BigInt(fracPadded || "0");
  return wei.toString();
}

// -------------------------------------------------------------
// Cookie banner
// -------------------------------------------------------------
function CookieBanner() {
  const [accepted, setAccepted] = useState(false);
  useEffect(() => {
    const v = localStorage.getItem("vrabo_cookie");
    if (v === "yes") setAccepted(true);
  }, []);
  const accept = () => {
    localStorage.setItem("vrabo_cookie", "yes");
    setAccepted(true);
  };
  if (accepted) return null;
  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white p-4 flex flex-col md:flex-row justify-between items-center gap-3 z-50">
      <span>
        🍪 Questo sito utilizza cookie per migliorare l’esperienza e tracciare
        link affiliati. Continuando accetti la{" "}
        <a href="/privacy" className="underline">
          Privacy Policy
        </a>
        .
      </span>
      <button
        onClick={accept}
        className="px-4 py-2 bg-blue-600 rounded-lg font-semibold"
      >
        Accetta
      </button>
    </div>
  );
}

// -------------------------------------------------------------
// Push notifications (demo)
// -------------------------------------------------------------
function usePushNotifications() {
  const [permission, setPermission] = useState("default");
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermission(Notification.permission);
  }, []);
  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    try {
      const p = await Notification.requestPermission();
      setPermission(p);
      if (p === "granted") {
        new Notification("🔔 VRABO", {
          body: "Notifiche attive: riceverai offerte e alert speciali!",
        });
      }
    } catch (err) {
      console.error("Notification error", err);
    }
  };
  return { permission, requestPermission };
}
// -------------------------------------------------------------
// SEZIONE DONAZIONI (slider + importi rapidi + QR + MetaMask deep-link)
// -------------------------------------------------------------
function Donations() {
  const [amount, setAmount] = useState(10); // € default
  const [chain, setChain] = useState(CHAINS[0]); // ETH
  const [copied, setCopied] = useState(false);

  const quick = [5, 10, 25, 50];

  const onQuick = (v) => setAmount(v);
  const onSlide = (e) => setAmount(round2(e.target.value));
  const onInput = (e) =>
    setAmount(
      round2(
        Math.min(10000, Math.max(0, Number(String(e.target.value).slice(0, 8))))
      )
    );

  // ------- PayPal -------
  const paypalUrl = useMemo(() => {
    // Documentazione donate: business (email), amount, currency_code, item_name (facoltativo)
    const p = new URL("https://www.paypal.com/donate");
    p.searchParams.set("business", PAYPAL_EMAIL);
    p.searchParams.set("currency_code", "EUR");
    if (amount > 0) p.searchParams.set("amount", String(amount));
    p.searchParams.set("item_name", "Donazione VRABO");
    return p.toString();
  }, [amount]);

  // ------- Stripe -------
  function openStripe() {
    // Se è definito un link "per importo", lo usa. Altrimenti usa il link principale.
    const link = STRIPE_LINKS_BY_AMOUNT[amount] || STRIPE_LINK_DEFAULT;
    openInNewTab(link);
  }

  // ------- Crypto / MetaMask -------
  const weiStr = amountToWeiStr(amount); // ETH value per EIP-681 su chain con 18 decimali
  // EIP-681 URI (definito da EIP-681) — usabile anche su desktop wallet
  const eip681 = `ethereum:${VRABO_WALLET}@${chain.id}?value=${weiStr}`;

  // MetaMask mobile universal link (alcune versioni richiedono "transfer", altre "send")
  // Nota: 'value' deve essere in WEI (stringa), senza decimali.
  const metamaskMobile = `${METAMASK_APP_BASE}/${VRABO_WALLET}@${chain.id}?value=${weiStr}`;

  const copyAddr = async () => {
    try {
      await navigator.clipboard.writeText(VRABO_WALLET);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-2">💙 Sostieni VRABO</h2>
      <p className="text-center text-sm text-gray-500 mb-6">
        Scegli un importo o usa lo slider. Puoi donare con carta (Stripe), PayPal
        o in crypto (MetaMask / qualsiasi wallet).
      </p>

      {/* Importi rapidi */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {quick.map((q) => (
          <button
            key={q}
            onClick={() => onQuick(q)}
            className={`px-4 py-2 rounded-full border ${
              amount === q
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            }`}
          >
            {q}€
          </button>
        ))}
      </div>

      {/* Slider + input */}
      <div className="flex items-center gap-4 justify-center mb-2">
        <input
          type="range"
          min="1"
          max="500"
          step="1"
          value={amount}
          onChange={onSlide}
          className="w-72"
        />
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="10000"
            step="1"
            value={amount}
            onChange={onInput}
            className="w-28 px-3 py-2 rounded-lg border text-black"
          />
          <span className="text-gray-500">€</span>
        </div>
      </div>

      {/* Bottoni donazione */}
      <div className="flex flex-wrap gap-3 justify-center my-6">
        <a
          href={paypalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold shadow"
        >
          PayPal
        </a>

        <button
          onClick={openStripe}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold shadow"
        >
          Stripe
        </button>

        {/* Selettore rete + deep-link MetaMask */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
          <select
            value={chain.id}
            onChange={(e) =>
              setChain(
                CHAINS.find((c) => c.id === Number(e.target.value)) || CHAINS[0]
              )
            }
            className="px-2 py-1 rounded-md border text-black"
          >
            {CHAINS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.symbol} · {c.name}
              </option>
            ))}
          </select>

          {/* Deep link: mobile (app link) + desktop (EIP-681) */}
          <a
            href={metamaskMobile}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white text-sm"
            title="Apri MetaMask (mobile). Su desktop usa l'icona a destra."
          >
            MetaMask mobile
          </a>
          <a
            href={eip681}
            className="px-3 py-2 bg-green-700 hover:bg-green-800 rounded-md text-white text-sm"
            title="Protocollo ethereum: EIP-681 (desktop wallet / estensioni)."
          >
            ethereum:
          </a>
        </div>
      </div>

      {/* Card Crypto: QR + copia + indirizzo */}
      <div className="grid sm:grid-cols-[180px_1fr] gap-4 items-center">
        <div className="bg-white p-3 rounded-xl border shadow-sm w-[180px] h-[180px] flex items-center justify-center">
          <QRCode value={VRABO_WALLET} size={150} />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <code className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg break-all">
              {VRABO_WALLET}
            </code>
            <button
              onClick={copyAddr}
              className="px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700"
            >
              {copied ? "Copiato ✓" : "Copia"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Invia {chain.symbol} sulla rete {chain.name}. L’importo scelto ({amount}
            €) viene convertito in **wei** nel deep-link (EIP-681). Verifica il
            controvalore nel tuo wallet prima di confermare.
          </p>
        </div>
      </div>
    </div>
  );
}
// -------------------------------------------------------------
// PAGINA PRINCIPALE
// -------------------------------------------------------------
export default function Home() {
  const { t } = useTranslation();
  const { permission, requestPermission } = usePushNotifications();

  // State base
  const [active, setActive] = useState("bnb");
  const [profile, setProfile] = useState({
    homeCity: "",
    budget: 150,
    travelers: 2,
    style: "smart",
    risk: "medium",
  });

  const [query, setQuery] = useState("");
  const [selectedSug, setSelectedSug] = useState(null); // {name, code, country}
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [guests, setGuests] = useState(2);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("score_desc");
  const [error, setError] = useState("");

  // Suggest state
  const [sugs, setSugs] = useState([]);
  const [showSugs, setShowSugs] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [isComposing, setIsComposing] = useState(false);

  const sugBoxRef = useRef(null);
  const inputWrapRef = useRef(null);
  const inputElRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // Persistenza ricerche
  const [recents, setRecents] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vrabo_profile");
      if (saved) setProfile(JSON.parse(saved));
      const r = localStorage.getItem("vrabo_recent");
      if (r) setRecents(JSON.parse(r));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("vrabo_profile", JSON.stringify(profile));
    } catch {}
  }, [profile]);

  const saveRecent = (item) => {
    try {
      const next = [{ ...item, ts: Date.now() }, ...recents]
        .filter(
          (x, i, arr) =>
            i ===
            arr.findIndex(
              (y) =>
                y.type === x.type &&
                y.query === x.query &&
                y.startDate === x.startDate &&
                y.endDate === x.endDate
            )
        )
        .slice(0, 8);
      setRecents(next);
      localStorage.setItem("vrabo_recent", JSON.stringify(next));
    } catch {}
  };

  // Vincoli date
  useEffect(() => {
    if (startDate && endDate && endDate < startDate) setEndDate(startDate);
  }, [startDate, endDate]);

  // Hotkey: / focus
  useEffect(() => {
    const h = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      )
        return;
      if (e.key === "/") {
        e.preventDefault();
        inputElRef.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Cambio sezione reset
  useEffect(() => {
    setQuery("");
    setSelectedSug(null);
    setSugs([]);
    setShowSugs(false);
    setError("");
    fetchTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Debounce + Abort suggerimenti
  useEffect(() => {
    if (!query || active === "finance" || active === "trading") {
      setSugs([]);
      setShowSugs(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort?.();
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const r = await fetch(`/api/suggest?q=${encodeURIComponent(query)}`, {
          signal: ac.signal,
        });
        const { suggestions } = await r.json();
        setSugs(suggestions || []);
        setShowSugs((suggestions || []).length > 0);
        setHighlight(-1);
      } catch {
        /* ignore */
      }
    }, 220);
    return () => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort?.();
    };
  }, [query, active]);

  // Click fuori chiude
  useEffect(() => {
    const onDocClick = (e) => {
      if (!sugBoxRef.current) return;
      if (
        !sugBoxRef.current.contains(e.target) &&
        !inputWrapRef.current?.contains(e.target)
      ) {
        setShowSugs(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const pickSuggestion = (s) => {
    setQuery(s.name);
    setSelectedSug(s);
    setShowSugs(false);
    inputElRef.current?.focus();
  };

  // Tastiera su input/tendina
  const handleKey = (e) => {
  if (isComposing) return;
  if (!showSugs || sugs.length === 0) {   // 👈 correggere qui
    if (e.key === "Enter") {
      e.preventDefault();
      doSearch();
    }
    if (e.key === "Escape") setShowSugs(false);
    return;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setHighlight((h) => (h + 1) % sugs.length);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setHighlight((h) => (h - 1 + sugs.length) % sugs.length);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (highlight >= 0) pickSuggestion(sugs[highlight]);
    else doSearch();
  } else if (e.key === "Escape") {
    setShowSugs(false);
  } else if (e.key === "Tab") {
    if (
      !e.shiftKey &&
      sugs[0]?.name?.toLowerCase()?.startsWith(query.toLowerCase())
    ) {
      setQuery(sugs[0].name);
      setSelectedSug(sugs[0]);
      setShowSugs(false);
    }
  }
};


  // Voice input
  const voiceInput = () => {
    const SR =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) return;
    const rec = new SR();
    rec.lang = "it-IT";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (ev) => {
      const t = ev.results?.[0]?.[0]?.transcript || "";
      if (t) {
        setQuery(t);
        setSelectedSug(null);
        setTimeout(doSearch, 0);
      }
    };
    rec.start();
  };

  // Swap rotta voli
  const canSwap = active === "flight" && /→|->|—|-|>/u.test(query);
  const swapRoute = () => {
    if (!canSwap) return;
    const sep = /→|->|—|-|>/u;
    const [a, b] = query.split(sep).map((s) => s.trim()).filter(Boolean);
    if (a && b) setQuery(`${b} → ${a}`);
  };

  // API: search
  const doSearch = async () => {
    setError("");
    setLoading(true);
    setResults([]);
    try {
      const body = {
        type: active,
        query,
        queryCode: selectedSug?.code || "",
        startDate: startDate ? toISO(startDate) : "",
        endDate: endDate ? toISO(endDate) : "",
        guests,
        profile,
        limit: 12,
      };
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResults(data.results || []);
      saveRecent({
        type: active,
        query,
        startDate: body.startDate,
        endDate: body.endDate,
        guests,
      });
    } catch {
      setError("Ops! Qualcosa è andato storto. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTop = async () => {
    setLoading(true);
    setResults([]);
    setError("");
    try {
      const body = {
        type: active,
        query: "",
        startDate: startDate ? toISO(startDate) : "",
        endDate: endDate ? toISO(endDate) : "",
        guests,
        profile,
        limit: 10,
      };
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setError("Impossibile caricare i suggerimenti ora.");
    } finally {
      setLoading(false);
    }
  };

  // Filtri/ordinamenti
  const priceMinAuto = useMemo(() => {
    const v = results
      .map((r) => r._priceVal)
      .filter((x) => typeof x === "number");
    return v.length ? Math.max(0, Math.min(...v)) : 0;
  }, [results]);

  const priceMaxAuto = useMemo(() => {
    const v = results
      .map((r) => r._priceVal)
      .filter((x) => typeof x === "number");
    return v.length ? Math.max(...v) : 0;
  }, [results]);

  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(0);

  useEffect(() => {
    setPriceMin(priceMinAuto);
    setPriceMax(priceMaxAuto);
  }, [priceMinAuto, priceMaxAuto]);

  const filtered = useMemo(() => {
    let arr = [...results];
    if (priceMax > 0) {
      arr = arr.filter((r) => {
        if (typeof r._priceVal !== "number") return true;
        return r._priceVal >= priceMin && r._priceVal <= priceMax;
      });
    }
    if (sort === "price_asc")
      arr.sort((a, b) => (a._priceVal ?? 0) - (b._priceVal ?? 0));
    if (sort === "price_desc")
      arr.sort((a, b) => (b._priceVal ?? 0) - (a._priceVal ?? 0));
    if (sort === "score_desc")
      arr.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return arr;
  }, [results, priceMin, priceMax, sort]);

  // ---------------- Form dinamico ----------------
  const SectionForm = () => {
    const clearQueryBtn =
      query && (
        <button
          type="button"
          aria-label="Pulisci destinazione"
          onClick={() => {
            setQuery("");
            setSelectedSug(null);
            setSugs([]);
            setShowSugs(false);
            inputElRef.current?.focus();
          }}
          className="absolute right-10 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700"
        >
          ✕
        </button>
      );

    const voiceBtn = (
      <button
        type="button"
        aria-label="Dettatura vocale"
        onClick={voiceInput}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200"
        title="Detta la destinazione"
      >
        🎤
      </button>
    );

    const swapBtn =
      canSwap && (
        <button
          type="button"
          aria-label="Inverti rotta"
          onClick={swapRoute}
          className="absolute right-18 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 hidden sm:block"
          title="Inverti rotta"
          style={{ right: "3.6rem" }}
        >
          ⇄
        </button>
      );

    const common = (
      <>
        <div className="relative flex-1" ref={inputWrapRef}>
          <input
            ref={inputElRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedSug(null);
            }}
            onFocus={() => sugs.length > 0 && setShowSugs(true)}
            onKeyDown={handleKey}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={
              active === "flight"
                ? "Città / rotta (es. Roma, FCO→JFK)…"
                : active === "car"
                ? "Città di ritiro (es. Milano)…"
                : "Dove vuoi andare?"
            }
            aria-label="Destinazione"
            role="combobox"
            aria-expanded={showSugs}
            aria-owns="vrabo-suggestion-list"
            aria-autocomplete="list"
            className="px-4 py-3 rounded-lg border shadow-sm w-full text-black pr-24 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {swapBtn}
          {clearQueryBtn}
          {voiceBtn}

          {showSugs && sugs.length > 0 && (
            <ul
              id="vrabo-suggestion-list"
              ref={sugBoxRef}
              role="listbox"
              className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border rounded-xl shadow-lg max-h-72 overflow-auto"
            >
              {sugs.map((s, idx) => (
                <li
                  key={`${s.code || s.name}-${idx}`}
                  role="option"
                  aria-selected={idx === highlight}
                  onMouseEnter={() => setHighlight(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickSuggestion(s)}
                  className={`px-4 py-2 cursor-pointer flex justify-between ${
                    idx === highlight
                      ? "bg-blue-50 dark:bg-blue-900/30"
                      : ""
                  }`}
                >
                  <span className="truncate">{s.name}</span>
                  <span className="text-sm text-gray-500">
                    {s.country ? `${s.country}` : ""}
                    {s.code ? ` · ${s.code}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DatePicker
          selected={startDate}
          onChange={setStartDate}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          minDate={new Date()}
          placeholderText={active === "flight" ? "Partenza" : "Check-in"}
          className="px-4 py-3 rounded-lg border shadow-sm text-black w-40"
        />
        <DatePicker
          selected={endDate}
          onChange={setEndDate}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate || new Date()}
          placeholderText={active === "flight" ? "Ritorno" : "Check-out"}
          className="px-4 py-3 rounded-lg border shadow-sm text-black w-40"
        />

        {(active === "bnb" || active === "car") && (
          <GuestsStepper value={guests} onChange={setGuests} min={1} max={16} />
        )}
      </>
    );

    if (active === "bnb" || active === "car" || active === "flight") {
      return (
        <div className="relative">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            {common}
            <button
              onClick={doSearch}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md"
            >
              {t("search")} →
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {POPULAR_CITIES.slice(0, 8).map((c) => (
              <button
                key={c}
                onClick={() => {
                  setQuery(c);
                  setSelectedSug(null);
                  setTimeout(doSearch, 0);
                }}
                className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (active === "finance") {
      return (
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca carta/conto (es. N26, Revolut)…"
            className="px-4 py-3 rounded-lg border shadow-sm flex-1 text-black"
          />
          <select
            value={profile.style}
            onChange={(e) =>
              setProfile((p) => ({ ...p, style: e.target.value }))
            }
            className="px-4 py-3 rounded-lg border shadow-sm text-black"
          >
            {FINANCE_STYLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={profile.budget}
            onChange={(e) =>
              setProfile((p) => ({ ...p, budget: +e.target.value || 0 }))
            }
            className="w-28 px-3 py-3 rounded-lg border shadow-sm text-black"
            placeholder="Budget"
          />
          <button
            onClick={doSearch}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md"
          >
            {t("search")} →
          </button>
        </div>
      );
    }

    if (active === "trading") {
      return (
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca broker/exchange (es. Binance, eToro)…"
            className="px-4 py-3 rounded-lg border shadow-sm flex-1 text-black"
          />
          <select
            value={profile.risk}
            onChange={(e) =>
              setProfile((p) => ({ ...p, risk: e.target.value }))
            }
            className="px-4 py-3 rounded-lg border shadow-sm text-black"
          >
            {RISK_LEVELS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            onClick={doSearch}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md"
          >
            {t("search")} →
          </button>
        </div>
      );
    }

    return null;
  };

  /* ------------------------------- Render ------------------------------- */
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white flex flex-col">
      {/* HERO */}
      <section className="relative min-h-[60vh] flex flex-col justify-center items-center text-center overflow-hidden">
        <video
          className="absolute w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="/bg.mp4"
        />
        <div className="absolute inset-0 bg-black/70" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-6xl px-6 w-full"
        >
          <h1 className="text-6xl font-extrabold text-white drop-shadow-lg">
            VRABO
          </h1>
          <p className="mt-4 text-lg text-gray-200">
            {t("heroTitle")} –{" "}
            <span className="text-blue-400 font-bold">{t("heroSubtitle")}</span>.
          </p>

          {/* Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  active === t.id
                    ? "bg-blue-600 text-white"
                    : "bg-white/90 text-gray-800"
                } shadow transition`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-5">
            <SectionForm />
          </div>

          {/* Recenti */}
          {!!recents.length && (
            <div className="mt-4 text-left">
              <p className="text-sm text-gray-300 mb-2">{t("recent")}</p>
              <div className="flex flex-wrap gap-2">
                {recents.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActive(r.type);
                      setQuery(r.query);
                      setSelectedSug(null);
                      setStartDate(r.startDate ? new Date(r.startDate) : null);
                      setEndDate(r.endDate ? new Date(r.endDate) : null);
                      setGuests(r.guests || 2);
                      setTimeout(doSearch, 0);
                    }}
                    className="px-3 py-1 rounded-full text-xs bg-white/90 text-gray-800 hover:bg-white"
                  >
                    {r.type} · {r.query || "Top"}{" "}
                    {r.startDate
                      ? `· ${new Date(r.startDate).toLocaleDateString("it-IT")}`
                      : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <p className="mt-4 text-blue-300">🔄 {t("loading")}</p>
          )}
          {error && <p className="mt-3 text-red-300">{error}</p>}
        </motion.div>
      </section>
      {/* FILTRI + RISULTATI */}
      <section className="max-w-7xl mx-auto py-10 px-6 flex-1">
        {!!results.length && (
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Ordina:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-3 py-2 rounded-lg border shadow-sm text-black"
                >
                  <option value="score_desc">🔥 Migliore combinazione</option>
                  <option value="price_asc">💰 Prezzo più basso</option>
                  <option value="price_desc">💎 Prezzo più alto</option>
                </select>
              </div>

              {priceMaxAuto > 0 && (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Prezzo:</span>
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) =>
                        setPriceMin(
                          clamp(parseInt(e.target.value || "0", 10), 0, priceMax)
                        )
                      }
                      className="w-24 px-2 py-1 rounded border text-black"
                    />
                    <span>—</span>
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) =>
                        setPriceMax(
                          Math.max(priceMin, parseInt(e.target.value || "0", 10))
                        )
                      }
                      className="w-24 px-2 py-1 rounded border text-black"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-80">
                    <input
                      type="range"
                      min={priceMinAuto}
                      max={priceMaxAuto}
                      value={clamp(priceMin, priceMinAuto, priceMax)}
                      onChange={(e) =>
                        setPriceMin(
                          clamp(+e.target.value, priceMinAuto, priceMax)
                        )
                      }
                      className="w-full"
                    />
                    <input
                      type="range"
                      min={priceMinAuto}
                      max={priceMaxAuto}
                      value={clamp(priceMax, priceMin, priceMaxAuto)}
                      onChange={(e) =>
                        setPriceMax(
                          clamp(+e.target.value, priceMin, priceMaxAuto)
                        )
                      }
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="text-sm text-gray-500">
              Trovate <b>{filtered.length}</b> offerte
            </div>
          </div>
        )}

        {/* Risultati */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="text-center py-20 bg-white/40 dark:bg-gray-900/30 rounded-2xl">
            <p className="text-xl font-semibold mb-2">Nessun risultato 🤷‍♂️</p>
            <p className="text-gray-500">
              Prova a cambiare destinazione, date o filtri prezzo.
            </p>
          </div>
        ) : (
          <>
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((r, i) => (
                <motion.a
                  key={i}
                  href={`/api/track?url=${encodeURIComponent(r.url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition flex flex-col"
                >
                  <img
                    src={r.image || "/logo.png"}
                    alt={r.title}
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg mb-1">{r.title}</h3>
                    <p className="text-sm text-gray-500 flex-1">{r.location}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xl text-blue-600 font-semibold">
                        {r.price}
                      </p>
                      {typeof r.score === "number" && (
                        <span className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 px-2 py-1 rounded-md">
                          score {r.score.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                      Vai all’offerta →
                    </button>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Grafico distribuzione prezzi */}
            <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">📊 Distribuzione prezzi</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={filtered.map((r) => ({
                    name: r.title.slice(0, 12) + "...",
                    prezzo: r._priceVal || 0,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="prezzo" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </section>

      {/* ABOUT */}
      <section id="about" className="py-16 text-center px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Cos’è VRABO</h2>
        <p className="text-gray-600 dark:text-gray-300">
          VRABO è un meta-comparatore che aggrega i migliori comparatori
          ufficiali. Alcuni link sono affiliati: <b>per te nulla cambia</b>,
          noi riceviamo una commissione che mantiene il servizio gratuito.
        </p>
      </section>

      {/* DONAZIONI AVANZATE */}
      <section
        id="donazioni"
        className="py-16 text-center bg-gradient-to-r from-blue-900 via-purple-900 to-black text-white"
      >
        <div className="px-4">
          <Donations />
        </div>
      </section>

      {/* CONTATTI */}
      <section id="contact" className="py-16 text-center px-6">
        <h2 className="text-3xl font-bold mb-6">📩 Contattaci</h2>
        <a
          href="mailto:info@vrabo.it"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold shadow-md text-white"
        >
          Invia Email
        </a>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500 bg-gray-100 dark:bg-gray-900">
        <p>© {new Date().getFullYear()} VRABO – Tutti i diritti riservati</p>
        <p>
          <a href="/privacy" className="underline">
            Privacy Policy
          </a>{" "}
          ·{" "}
          <a href="/cookies" className="underline">
            Cookie Policy
          </a>
        </p>
      </footer>

      {/* Cookie banner */}
      <CookieBanner />
    </div>
  );
}

// -------------------------------------------------------------
// Componenti riutilizzati
// -------------------------------------------------------------
function GuestsStepper({ value, onChange, min = 1, max = 16 }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Diminuisci ospiti"
        onClick={() => onChange(clamp((value || min) - 1, min, max))}
        className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border"
      >
        −
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) =>
          onChange(clamp(parseInt(e.target.value || "0", 10), min, max))
        }
        className="w-16 px-3 py-2 rounded-lg border text-center text-black"
      />
      <button
        type="button"
        aria-label="Aumenta ospiti"
        onClick={() => onChange(clamp((value || min) + 1, min, max))}
        className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border"
      >
        +
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg animate-pulse">
      <div className="h-44 w-full bg-gray-200 dark:bg-gray-700" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}
