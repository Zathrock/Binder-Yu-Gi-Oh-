const CACHE_NAME = "binder-shell-v8";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  // Librerie Grafiche (così l'app parte anche senza rete, ma senza le foto delle carte)
  "https://cdn.tailwindcss.com",
  "https://unpkg.com/react@18/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
  "https://unpkg.com/@babel/standalone/babel.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
];

// 1. Installazione: Prepara il Guscio
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

// 2. Pulizia: Rimuovi vecchie versioni
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.map((key) => key !== CACHE_NAME && caches.delete(key)))));
  return self.clients.claim();
});

// 3. Fetch: Logica Ibrida
self.addEventListener("fetch", (e) => {
  // A. Se sono immagini di carte (ygoprodeck), NON salvare in cache (Network Only)
  if (e.request.url.includes("ygoprodeck.com") || e.request.url.includes("images")) {
    e.respondWith(fetch(e.request));
    return;
  }

  // B. Per il resto, usa la cache se possibile
  e.respondWith(
    caches.match(e.request).then((res) => {
      // Trucco GitHub Pages per la root
      if (e.request.url.endsWith("/")) return caches.match("./index.html");
      return res || fetch(e.request);
    })
  );

});


