// ==========================================
// VRABO — Helpers (Global utilities)
// Ultimo aggiornamento: 2025-08-28
// ==========================================

// ✅ Forza un numero a stare tra min e max
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// ✅ Data → ISO string
export const toISO = (d) => (d ? new Date(d).toISOString() : "");

// ✅ Apri URL in nuova tab sicura
export const openInNewTab = (url) => {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
};

// ✅ Arrotonda a 2 decimali
export const round2 = (x) => Math.round((Number(x) || 0) * 100) / 100;

// ✅ Genera uno slug URL-safe
export const slugify = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// ✅ Formatta prezzo in €
export const formatPrice = (val) =>
  typeof val === "number"
    ? new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
      }).format(val)
    : val || "";

// ✅ Safe localStorage get
export const loadLS = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

// ✅ Safe localStorage set
export const saveLS = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
};

// ✅ Random ID
export const randomId = (prefix = "id") =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

// ✅ Debounce (ritarda esecuzione)
export const debounce = (fn, delay = 300) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

// ✅ Throttle (limita frequenza esecuzione)
export const throttle = (fn, wait = 300) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), wait);
    }
  };
};
