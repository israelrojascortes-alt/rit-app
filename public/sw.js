// Service worker RIT DRT: permite instalar la app y abrir el formulario, la guía y las preguntas sin señal.
// El envío de la RIT y el panel siempre usan la red (los datos no se guardan en caché).
const CACHE = "rit-drt-v1";
const PRECACHE = ["/", "/rit/nueva", "/guia", "/preguntas", "/icons/icon-192.png", "/logos/codelco.png", "/logos/seguridad-salud-bienestar.png", "/logos/5-valores.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/panel")) return; // siempre en línea

  // Archivos estáticos de Next.js e imágenes: primero caché
  if (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/logos") || url.pathname.startsWith("/icons")) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })),
    );
    return;
  }

  // Páginas: primero red; sin señal, la última copia guardada
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("/"))),
    );
  }
});
