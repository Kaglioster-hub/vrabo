// ==========================================
// 🤖 VRABO Service Worker
// Ultra Supreme 10X Edition
// PWA Full-stack: Cache strategies + Offline + Push + Background Sync
// Ultimo aggiornamento: 2025-08-28
// ==========================================

const CACHE_VERSION = "v10";
const STATIC_CACHE = `vrabo-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `vrabo-dynamic-${CACHE_VERSION}`;
const IMMUTABLE_CACHE = `vrabo-immutable-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

const MAX_DYNAMIC_ITEMS = 80;
const IMMUTABLE_ASSETS = [
  "https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css",
  "https://unpkg.com/framer-motion/dist/framer-motion.js"
];

// --- Helpers ---
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    console.log(`🗑️ [SW] Rimossa cache più vecchia da ${cacheName}`);
  }
}

// --- Install: precache offline + immutable ---
self.addEventListener("install", (event) => {
  console.log("🔧 [SW] Installazione…");
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) =>
        cache.addAll([OFFLINE_URL, "/android-chrome-192x192.png", "/favicon.ico"])
      ),
      caches.open(IMMUTABLE_CACHE).then((cache) => cache.addAll(IMMUTABLE_ASSETS))
    ])
  );
  self.skipWaiting();
});

// --- Activate: clean old caches ---
self.addEventListener("activate", (event) => {
  console.log("🚀 [SW] Attivazione e pulizia vecchie cache");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (k) =>
              ![STATIC_CACHE, DYNAMIC_CACHE, IMMUTABLE_CACHE].includes(k)
          )
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// --- Fetch strategies ---
// 1. HTML navigations → Network first + offline fallback
// 2. API → Network with cache fallback
// 3. Images/video → Cache-first, limit size
// 4. Immutable libs → Cache-only
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const { request } = event;
  const url = new URL(request.url);

  // Navigazioni (pagine HTML)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, res.clone()));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Asset immutabili (cdn, librerie)
  if (IMMUTABLE_ASSETS.some((asset) => url.href.includes(asset))) {
    event.respondWith(caches.match(request));
    return;
  }

  // API (es: /api/search)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, res.clone()));
          trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
          return res.clone();
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Immagini / video → cache-first
  if (request.destination === "image" || request.destination === "video") {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, res.clone()));
            trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
            return res.clone();
          })
      )
    );
    return;
  }

  // Default → network-first con fallback cache
  event.respondWith(
    fetch(request)
      .then((res) => {
        caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, res.clone()));
        return res.clone();
      })
      .catch(() => caches.match(request))
  );
});

// --- Background Sync (retry invii se offline) ---
self.addEventListener("sync", (event) => {
  if (event.tag === "vrabo-sync-donations") {
    console.log("🔄 [SW] Ritento sync donazioni…");
    event.waitUntil(
      // esempio retry → potresti loggare su /api/track o inviare dati pending
      fetch("/api/track?retry=1").catch(() =>
        console.warn("⚠️ [SW] Sync donazioni fallito di nuovo")
      )
    );
  }
});

// --- Push notifications avanzate ---
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: "📢 VRABO", body: event.data?.text() || "Nuova offerta disponibile!", url: "/" };
  }

  const options = {
    body: data.body,
    icon: "/android-chrome-192x192.png",
    badge: "/android-chrome-192x192.png",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/" },
    actions: [
      { action: "open", title: "Apri VRABO", icon: "/favicon-32x32.png" },
      { action: "close", title: "Chiudi", icon: "/favicon-16x16.png" }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// --- Notification click handler ---
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "close") return;
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      const hadWindow = clientsArr.some((w) => w.url.includes(targetUrl));
      if (!hadWindow && clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
