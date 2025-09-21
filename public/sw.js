const CACHE = "vrabo-total-v1";
const OFFLINE_URL = "/offline.html";
self.addEventListener("install",(e)=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll([OFFLINE_URL,"/manifest.json","/icon.svg"])));self.skipWaiting();});
self.addEventListener("activate",(e)=>{e.waitUntil(self.clients.claim());});
self.addEventListener("fetch",(e)=>{
  const req=e.request; if(req.method!=="GET") return;
  e.respondWith((async()=>{try{const net=await fetch(req);return net;}catch{const cache=await caches.open(CACHE);const m=await cache.match(req);return m||(await cache.match(OFFLINE_URL));}})());
});
