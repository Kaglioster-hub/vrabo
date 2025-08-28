// ============================================================================
// VRABO – Motore di ricerca comparatore SUPREME GODLEVEL EDITION
// - Multi-provider completo (bnb, voli, auto, transfer, finance, trading…)
// - Legge .env dinamicamente (anche se placeholder → fallback automatici)
// - Dedup, scoring adattivo, mock generator realistici
// - Ottimizzato per Next.js 14 API routes
// ============================================================================

// ===================== CONFIG BASE =====================
const COMM = {
  bnb: 0.07,
  flight: 0.09,
  car: 0.07,
  transfer: 0.08,
  finance: 0.4,
  trading: 0.3,
  tickets: 0.15,
  connectivity: 0.2,
  insurance: 0.25,
  software: 0.35,
  energy: 0.2,
};

const DEFAULT_CURRENCY = "EUR";
const IMG_FALLBACK = "https://picsum.photos/seed/vrabo/600/360";

// API endpoints esterni
const HOTELLOOK_API = "https://engine.hotellook.com/api/v2/cache.json";
const FLIGHTS_CHEAP = "https://api.travelpayouts.com/v1/prices/cheap";
const EXCHANGE_API = "https://api.exchangerate.host/latest";

// Debug toggle
const DEBUG = true;

// ===================== UTILS =====================
const log = (...args) => DEBUG && console.log("[VRABO-API]", ...args);
const safeStr = (s, def = "") => (typeof s === "string" && s.trim() ? s.trim() : def);
const toISODate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const onlyNum = (v) =>
  typeof v === "number"
    ? v
    : Number(String(v ?? "").replace(/[^\d.,-]/g, "").replace(",", ".")) || null;

const uniqBy = (arr, keyFn) => {
  const seen = new Set();
  return arr.filter((x) => {
    const k = keyFn(x);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

// ===================== FETCH + CACHE =====================
async function fetchRetry(url, opts = {}, retries = 3, delay = 500) {
  try {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res;
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((r) => setTimeout(r, delay));
    return fetchRetry(url, opts, retries - 1, delay * 2);
  }
}
const cache = new Map();
function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.exp) {
    cache.delete(key);
    return null;
  }
  return hit.val;
}
function cacheSet(key, val, ttlMs = 60_000) {
  cache.set(key, { val, exp: Date.now() + ttlMs });
}

// ===================== FX Conversion =====================
async function convertPrice(value, from = "EUR", to = DEFAULT_CURRENCY) {
  if (!value || from === to) return { val: value, cur: to };
  const key = `fx:${from}->${to}`;
  let rate = cacheGet(key);
  if (!rate) {
    try {
      const r = await fetchRetry(`${EXCHANGE_API}?base=${from}&symbols=${to}`);
      const j = await r.json();
      rate = j.rates?.[to] || 1;
      cacheSet(key, rate, 3600_000);
    } catch {
      rate = 1;
    }
  }
  return { val: Math.round(value * rate * 100) / 100, cur: to };
}

// ===================== AFFILIATE URL BUILDER =====================
// legge NEXT_PUBLIC_AFF_ID_TYPE, TYPE2, TYPE3… dall'.env
function buildAffiliateUrl(type) {
  const base = `NEXT_PUBLIC_AFF_ID_${type.toUpperCase()}`;
  for (let i = 0; i < 6; i++) {
    const key = i === 0 ? base : `${base}${i+1}`;
    if (process.env[key] && !process.env[key].includes("PLACEHOLDER")) {
      return process.env[key];
    }
  }
  return "#";
}
// ===================== NORMALIZE =====================
function normalizeItem({
  title,
  price,
  priceVal,
  location,
  image,
  url,
  tags = [],
  popularity = 0.6,
  description = "",
  rating = null,
  provider = "generic",
  type = "bnb",
}) {
  let img = safeStr(image, IMG_FALLBACK);
  if (!/^https?:\/\//i.test(img)) img = IMG_FALLBACK;

  let href = safeStr(url, "#");
  if (href !== "#" && !/^https?:\/\//i.test(href)) href = "#";

  return {
    title: safeStr(title, "Offerta"),
    description,
    rating: typeof rating === "number" ? rating : null,
    price: safeStr(price, "—"),
    _priceVal: typeof priceVal === "number" ? priceVal : null,
    location: safeStr(location, "—"),
    image: img,
    url: href,
    provider,
    tags: Array.isArray(tags) ? tags : [],
    popularity,
    commissionEst: priceVal ? priceVal * (COMM[type] || 0.05) : null,
  };
}

// ===================== SCORING =====================
function score(x, type, profile, ctx = {}) {
  const comm = COMM[type] || 0.05;
  const style = profile?.style || "smart";
  const risk = profile?.risk || "medium";
  const budget = Number(profile?.budget || 150);

  let a = 1;
  if (x.tags?.includes(style)) a += 0.25;
  if (type === "trading" && x.tags?.includes(risk)) a += 0.25;

  if (typeof x._priceVal === "number" && x._priceVal > 0) {
    const rel = clamp(budget / x._priceVal, 0.5, 1.5);
    a *= rel;
  }
  if (ctx.hasDates) a *= 1.05;
  if (x.rating) a *= 0.8 + (x.rating / 5) * 0.4;

  const pop = (x.popularity || 1) * 0.15 + 0.925;
  return comm * 100 * a * pop;
}

// ===================== MOCK GENERATOR =====================
// se API esterna fallisce → generiamo offerte fake credibili
function mockGenerator(type, query = "Roma", limit = 6) {
  const arr = [];
  for (let i = 0; i < limit; i++) {
    const p = Math.round(40 + Math.random() * 200);
    arr.push(
      normalizeItem({
        type,
        title: `${type.toUpperCase()} speciale ${query} #${i+1}`,
        price: `${p} EUR`,
        priceVal: p,
        location: query,
        image: `https://picsum.photos/seed/${type}${i}/600/360`,
        popularity: 0.5 + Math.random() * 0.5,
        tags: ["smart"],
        provider: "MockVRABO",
        url: buildAffiliateUrl(type),
      })
    );
  }
  return arr;
}

// ===================== HANDLER HOTELS / BNB =====================
async function handleHotels({ query, startDate, endDate, currency }) {
  const out = [];
  try {
    const url = new URL(HOTELLOOK_API);
    url.searchParams.set("location", safeStr(query, "Rome"));
    url.searchParams.set("currency", "EUR"); // Travelpayouts base
    url.searchParams.set("limit", "30");
    if (startDate) url.searchParams.set("checkIn", toISODate(startDate));
    if (endDate) url.searchParams.set("checkOut", toISODate(endDate));
    if (process.env.TRAVELPAYOUTS_KEY) url.searchParams.set("token", process.env.TRAVELPAYOUTS_KEY);

    const r = await fetchRetry(url.toString());
    const hotels = (await r.json()) || [];

    for (let i = 0; i < hotels.length; i++) {
      const h = hotels[i];
      const p = onlyNum(h.priceFrom || h.price || 0);
      const { val, cur } = await convertPrice(p, "EUR", currency);
      out.push(
        normalizeItem({
          type: "bnb",
          title: h.name || `Alloggio a ${query}`,
          price: typeof val === "number" ? `${val} ${cur}` : "—",
          priceVal: val,
          location: h.location?.name || query,
          image: h.photo || `https://picsum.photos/seed/hotel${i}/600/360`,
          popularity: 0.65 + Math.random() * 0.35,
          tags: ["smart"],
          rating: h.stars || null,
          description: h.address || "",
          provider: "Hotellook",
          url: buildAffiliateUrl("HOTEL"),
        })
      );
    }
    if (!out.length) out.push(...mockGenerator("bnb", query, 8));
  } catch (err) {
    log("Hotel search error:", err.message);
    out.push(...mockGenerator("bnb", query, 8));
  }
  return out;
}

// ===================== HANDLER FLIGHTS =====================
async function handleFlights({ query, currency }) {
  const out = [];
  try {
    const origin = query.slice(0, 3).toUpperCase();
    const url = new URL(FLIGHTS_CHEAP);
    url.searchParams.set("origin", origin);
    url.searchParams.set("token", process.env.TRAVELPAYOUTS_KEY || "");
    url.searchParams.set("currency", "EUR");

    const r = await fetchRetry(url.toString());
    const j = await r.json();
    const data = j?.data || {};

    Object.keys(data).forEach((dest) => {
      const flights = data[dest] || {};
      Object.keys(flights).forEach((fareClass) => {
        const f = flights[fareClass];
        const p = onlyNum(f.price || 0);
        out.push(
          normalizeItem({
            type: "flight",
            title: `${origin} → ${dest} (${fareClass})`,
            price: `${p} EUR`,
            priceVal: p,
            location: `${origin} → ${dest}`,
            image: `https://picsum.photos/seed/flight${dest}/600/360`,
            popularity: 0.7 + Math.random() * 0.3,
            tags: ["smart"],
            provider: "Travelpayouts",
            url: buildAffiliateUrl("FLIGHT"),
          })
        );
      });
    });

    // Fallback Kiwi
    out.push(
      normalizeItem({
        type: "flight",
        title: `${origin} → ANY (via Kiwi)`,
        price: "—",
        location: query,
        image: `https://picsum.photos/seed/kiwi/600/360`,
        popularity: 0.7,
        provider: "Kiwi",
        url: buildAffiliateUrl("FLIGHT2"),
      })
    );

    if (!out.length) out.push(...mockGenerator("flight", query, 6));
  } catch (err) {
    log("Flight search error:", err.message);
    out.push(...mockGenerator("flight", query, 6));
  }
  return out;
}
// ===================== HANDLER AUTO =====================
function handleCars({ profile, currency }) {
  const out = [];
  const base = onlyNum(profile?.budget) || 25;
  ["Aeroporto", "Centro città", "Stazione"].forEach((place, idx) => {
    const p = Math.max(12, Math.round(base * (0.85 + idx * 0.22)));
    out.push(
      normalizeItem({
        type: "car",
        title: `Auto a ${place}`,
        price: `${p} ${currency}/giorno`,
        priceVal: p,
        location: place,
        image: `https://picsum.photos/seed/car${idx}/600/360`,
        popularity: 0.6 + Math.random() * 0.4,
        tags: ["basic", "smart"],
        provider: "RentalCars",
        url: buildAffiliateUrl("CAR"),
      })
    );
  });
  return out;
}

// ===================== HANDLER TRANSFER =====================
function handleTransfers(query) {
  return [
    normalizeItem({
      type: "transfer",
      title: "Transfer Aeroporto",
      price: "da 15€",
      priceVal: 15,
      location: query || "Aeroporto",
      image: "/transfer.png",
      popularity: 0.7,
      tags: ["basic", "smart"],
      provider: "Transfers",
      url: buildAffiliateUrl("TRANSFER"),
    }),
  ];
}

// ===================== HANDLER FINANCE =====================
function handleFinance() {
  return [
    normalizeItem({
      type: "finance",
      title: "N26 Standard",
      price: "0 €/mese",
      priceVal: 0,
      location: "Conto online",
      image: "/n26.png",
      popularity: 0.85,
      tags: ["basic", "smart"],
      provider: "N26",
      url: buildAffiliateUrl("FINANCE"),
    }),
    normalizeItem({
      type: "finance",
      title: "Revolut Premium",
      price: "7,99 €/mese",
      priceVal: 7.99,
      location: "Globale",
      image: "/revolut.png",
      popularity: 0.9,
      tags: ["smart", "luxury"],
      provider: "Revolut",
      url: buildAffiliateUrl("FINANCE"),
    }),
  ];
}

// ===================== HANDLER TRADING =====================
function handleTrading() {
  return [
    normalizeItem({
      type: "trading",
      title: "eToro",
      price: "0% su azioni",
      priceVal: 0,
      location: "Multi-asset",
      image: "/etoro.png",
      popularity: 0.9,
      tags: ["low", "medium"],
      provider: "eToro",
      url: buildAffiliateUrl("TRADING"),
    }),
    normalizeItem({
      type: "trading",
      title: "Binance",
      price: "Fee crypto basse",
      priceVal: 0.1,
      location: "Exchange",
      image: "/binance.png",
      popularity: 0.95,
      tags: ["medium", "high"],
      provider: "Binance",
      url: buildAffiliateUrl("TRADING"),
    }),
  ];
}

// ===================== HANDLER TICKETS =====================
function handleTickets(query) {
  return [
    normalizeItem({
      type: "tickets",
      title: "Eventi & Musei",
      price: "da 5€",
      priceVal: 5,
      location: query || "Roma",
      image: "/tickets.png",
      popularity: 0.8,
      tags: ["culture", "smart"],
      provider: "Tiqets",
      url: buildAffiliateUrl("TICKETS"),
    }),
    normalizeItem({
      type: "tickets",
      title: "Concerti & Spettacoli",
      price: "da 20€",
      priceVal: 20,
      location: query || "Milano",
      image: "/tickets2.png",
      popularity: 0.85,
      tags: ["music", "live"],
      provider: "TicketNetwork",
      url: buildAffiliateUrl("TICKETS2"),
    }),
  ];
}

// ===================== HANDLER CONNECTIVITY =====================
function handleConnectivity() {
  return [
    normalizeItem({
      type: "connectivity",
      title: "Yesim eSIM",
      price: "—",
      location: "Globale",
      image: "/esim.png",
      popularity: 0.8,
      tags: ["mobile"],
      provider: "Yesim",
      url: buildAffiliateUrl("CONNECTIVITY1"),
    }),
    normalizeItem({
      type: "connectivity",
      title: "Airalo eSIM",
      price: "—",
      location: "Globale",
      image: "/airalo.png",
      popularity: 0.85,
      tags: ["mobile"],
      provider: "Airalo",
      url: buildAffiliateUrl("CONNECTIVITY2"),
    }),
  ];
}

// ===================== HANDLER INSURANCE =====================
function handleInsurance() {
  return [
    normalizeItem({
      type: "insurance",
      title: "EKTA Travel Insurance",
      price: "da 20€",
      priceVal: 20,
      location: "Globale",
      image: "/insurance.png",
      popularity: 0.8,
      tags: ["safety"],
      provider: "EKTA",
      url: buildAffiliateUrl("INSURANCE"),
    }),
  ];
}

// ===================== HANDLER SOFTWARE =====================
function handleSoftware() {
  return [
    normalizeItem({
      type: "software",
      title: "NordVPN",
      price: "da 3€/mese",
      priceVal: 3,
      location: "Globale",
      image: "/vpn.png",
      popularity: 0.9,
      tags: ["security"],
      provider: "NordVPN",
      url: buildAffiliateUrl("SOFTWARE"),
    }),
  ];
}

// ===================== HANDLER ENERGY =====================
function handleEnergy() {
  return [
    normalizeItem({
      type: "energy",
      title: "Offerta Energia Verde",
      price: "da 30€/mese",
      priceVal: 30,
      location: "Italia",
      image: "/energy.png",
      popularity: 0.7,
      tags: ["green"],
      provider: "EnergyCo",
      url: buildAffiliateUrl("ENERGY"),
    }),
  ];
}

// ===================== MAIN HANDLER =====================
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const {
      type = "bnb",
      query = "",
      startDate = "",
      endDate = "",
      profile = {},
      limit = 12,
      currency = DEFAULT_CURRENCY,
    } = req.body;

    let results = [];

    switch (type) {
      case "bnb":
        results = await handleHotels({ query, startDate, endDate, currency });
        break;
      case "flight":
        results = await handleFlights({ query, currency });
        break;
      case "car":
        results = handleCars({ profile, currency });
        break;
      case "transfer":
        results = handleTransfers(query);
        break;
      case "finance":
        results = handleFinance();
        break;
      case "trading":
        results = handleTrading();
        break;
      case "tickets":
        results = handleTickets(query);
        break;
      case "connectivity":
        results = handleConnectivity();
        break;
      case "insurance":
        results = handleInsurance();
        break;
      case "software":
        results = handleSoftware();
        break;
      case "energy":
        results = handleEnergy();
        break;
      default:
        results = mockGenerator(type, query, 8);
        break;
    }

    // dedup + scoring finale
    const deduped = uniqBy(results, (x) => `${x.title}__${x.url}`);
    const enriched = deduped.map((x) => ({
      ...x,
      score: score(x, type, profile, { hasDates: Boolean(startDate && endDate) }),
    }));
    enriched.sort((a, b) => (b.score || 0) - (a.score || 0));

    const final = enriched.slice(0, clamp(limit, 1, 50));
    return res.status(200).json({ results: final });
  } catch (e) {
    console.error("API search error:", e);
    return res.status(500).json({ error: "API failure" });
  }
}
