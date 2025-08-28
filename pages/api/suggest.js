// pages/api/suggest.js
// ============================================================================
// VRABO – Suggest API SUPREME 1000x
// - Autocomplete Travelpayouts con ranking avanzato, fuzzy, cache LRU, retry pro
// ============================================================================

const TP_AUTOCOMPLETE = "https://autocomplete.travelpayouts.com/places2";
const DEBUG = process.env.NODE_ENV !== "production";

// ================= CACHE LRU =================
const MAX_CACHE = 500;
const cache = new Map();
function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.exp) {
    cache.delete(key);
    return null;
  }
  // refresh LRU
  cache.delete(key);
  cache.set(key, hit);
  return hit.val;
}
function cacheSet(key, val, ttl = 300000) {
  if (cache.size > MAX_CACHE) {
    // delete first (LRU)
    const first = cache.keys().next().value;
    cache.delete(first);
  }
  cache.set(key, { val, exp: Date.now() + ttl });
}

// ================= RATE LIMIT (per IP) =================
const BUCKET = new Map();
const WINDOW_MS = 5000;
const MAX_REQ = 30;
function limited(ip) {
  const now = Date.now();
  const b = BUCKET.get(ip) || { c: 0, t: now };
  if (now - b.t > WINDOW_MS) {
    BUCKET.set(ip, { c: 1, t: now });
    return false;
  }
  b.c++;
  BUCKET.set(ip, b);
  return b.c > MAX_REQ;
}

// ================= HELPERS =================
async function fetchRetry(url, retries = 3, delay = 400, timeout = 4000) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r;
    } catch (err) {
      clearTimeout(t);
      lastErr = err;
      if (i === retries) break;
      // exponential backoff con jitter
      const jitter = Math.random() * 100;
      await new Promise((res) => setTimeout(res, delay * 2 ** i + jitter));
    }
  }
  throw lastErr;
}

function normalize(x) {
  return {
    name: x.name || x.city_name || "",
    code: x.code || x.iata_code || "",
    type: x.type || x.kind || "city",
    country: x.country_name || x.country || "",
    weight: x.weight || x.rate || 0,
    isCapital: !!x.is_city && x.importance > 1000,
  };
}

// fuzzy match semplificato (levenshtein distanza)
function levenshtein(a, b) {
  if (!a || !b) return 99;
  const m = [];
  for (let i = 0; i <= b.length; i++) m[i] = [i];
  for (let j = 0; j <= a.length; j++) m[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      m[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? m[i - 1][j - 1]
        : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    }
  }
  return m[b.length][a.length];
}

function rankSuggestions(list, q = "", home = "", mode = "general", lng = "it") {
  const query = q.toLowerCase();
  return list
    .map((s) => {
      let score = 0;
      const nameLc = s.name.toLowerCase();
      if (nameLc.startsWith(query)) score += 120;
      else if (nameLc.includes(query)) score += 60;

      if (s.code.toLowerCase().startsWith(query)) score += 150;

      if (s.type === "airport" && mode === "flight") score += 70;
      if (s.type === "hotel" && (mode === "hotel" || mode === "bnb")) score += 50;
      if (s.country.toLowerCase().includes(home.toLowerCase())) score += 30;
      if (s.isCapital) score += 40;

      // fuzzy: penalità più bassa = più vicino
      const dist = levenshtein(nameLc, query);
      score += Math.max(0, 30 - dist);

      // boost lingua
      if (lng === "it" && ["roma", "milano", "venezia"].includes(nameLc)) score += 25;

      score += Math.min(50, s.weight / 500);
      return { ...s, _score: score };
    })
    .sort((a, b) => b._score - a._score);
}

// ================= FALLBACK =================
const FALLBACK = [
  { name: "Roma", code: "ROM", type: "city", country: "Italia" },
  { name: "Milano", code: "MIL", type: "city", country: "Italia" },
  { name: "Parigi", code: "PAR", type: "city", country: "Francia" },
  { name: "Londra", code: "LON", type: "city", country: "UK" },
  { name: "New York", code: "NYC", type: "city", country: "USA" },
  { name: "Tokyo", code: "TYO", type: "city", country: "Giappone" },
  { name: "Dubai", code: "DXB", type: "city", country: "UAE" },
  { name: "Bangkok", code: "BKK", type: "city", country: "Thailandia" },
];

// ================= HANDLER =================
export default async function handler(req, res) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || "";
  if (limited(ip)) return res.status(429).json({ error: "Too Many Requests" });

  const q = String(req.query.q || "").trim();
  const lng = (req.query.lng || "it").toString().trim().toLowerCase();
  const home = String(req.query.home || "").trim();
  const mode = String(req.query.mode || "general").trim();
  const limit = Math.min(parseInt(req.query.limit || "12", 10), 50);

  if (!q) {
    return res.status(200).json({ suggestions: FALLBACK.slice(0, limit) });
  }

  const key = `sug:${lng}:${mode}:${q}`;
  const cached = cacheGet(key);
  if (cached) return res.status(200).json({ suggestions: cached.slice(0, limit), cached: true });

  try {
    const url = `${TP_AUTOCOMPLETE}?term=${encodeURIComponent(q)}&locale=${lng}&types[]=city&types[]=airport&types[]=region&types[]=country&types[]=station`;
    const r = await fetchRetry(url);
    const j = await r.json();

    let suggestions = (j || []).map(normalize);

    // Dedup
    const seen = new Set();
    suggestions = suggestions.filter((s) => {
      const k = (s.name + s.country).toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    const ranked = rankSuggestions(suggestions, q, home, mode, lng).slice(0, limit);
    cacheSet(key, ranked);
    return res.status(200).json({ suggestions: ranked, cached: false });
  } catch (err) {
    if (DEBUG) console.error("Suggest API error:", err);
    return res.status(200).json({ suggestions: FALLBACK.slice(0, limit), fallback: true });
  }
}
