// pages/api/suggest.js
// ============================================================================
// VRABO – Suggest API SUPREME EDITION
// - Autocomplete Travelpayouts con ranking, cache, retry, fallback
// ============================================================================

const TP_AUTOCOMPLETE = "https://autocomplete.travelpayouts.com/places2";
const DEBUG = process.env.NODE_ENV !== "production";

// Cache in memoria
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
function cacheSet(key, val, ttl = 300000) {
  cache.set(key, { val, exp: Date.now() + ttl });
}

// Retry con timeout
async function fetchRetry(url, retries = 2, delay = 300, timeout = 3500) {
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
      await new Promise((res) => setTimeout(res, delay * (2 ** i)));
    }
  }
  throw lastErr;
}

// Normalizza risultati
function normalize(x) {
  return {
    name: x.name || x.city_name || "",
    code: x.code || x.iata_code || "",
    type: x.type || x.kind || "city",
    country: x.country_name || x.country || "",
    weight: x.weight || x.rate || 0,
  };
}

// Ranking semplice
function rankSuggestions(list, q = "", home = "", mode = "general") {
  const query = q.toLowerCase();
  return list
    .map((s) => {
      let score = 0;
      const nameLc = s.name.toLowerCase();
      if (nameLc.startsWith(query)) score += 80;
      else if (nameLc.includes(query)) score += 40;
      if (s.code.toLowerCase().startsWith(query)) score += 100;
      if (s.type === "airport" && mode === "flight") score += 50;
      if (s.type === "hotel" && (mode === "hotel" || mode === "bnb")) score += 30;
      if (s.country.toLowerCase().includes(home.toLowerCase())) score += 20;
      score += Math.min(30, s.weight / 1000);
      return { ...s, _score: score };
    })
    .sort((a, b) => b._score - a._score);
}

// Fallback statico
const FALLBACK = [
  { name: "Roma", code: "ROM", type: "city", country: "Italia" },
  { name: "Milano", code: "MIL", type: "city", country: "Italia" },
  { name: "Parigi", code: "PAR", type: "city", country: "Francia" },
  { name: "Londra", code: "LON", type: "city", country: "UK" },
  { name: "New York", code: "NYC", type: "city", country: "USA" },
  { name: "Tokyo", code: "TYO", type: "city", country: "Giappone" },
];

export default async function handler(req, res) {
  const q = String(req.query.q || "").trim();
  const lng = (req.query.lng || "it").toString().trim().toLowerCase();
  const home = String(req.query.home || "").trim();
  const mode = String(req.query.mode || "general").trim();
  const limit = Math.min(parseInt(req.query.limit || "12", 10), 50);

  if (!q) {
    return res.status(200).json({ suggestions: FALLBACK });
  }

  const key = `sug:${lng}:${mode}:${q}`;
  const cached = cacheGet(key);
  if (cached) return res.status(200).json({ suggestions: cached.slice(0, limit) });

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

    const ranked = rankSuggestions(suggestions, q, home, mode).slice(0, limit);
    cacheSet(key, ranked);
    return res.status(200).json({ suggestions: ranked });
  } catch (err) {
    if (DEBUG) console.error("Suggest API error:", err);
    return res.status(200).json({ suggestions: FALLBACK });
  }
}
