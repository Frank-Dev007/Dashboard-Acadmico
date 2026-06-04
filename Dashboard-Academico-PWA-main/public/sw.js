/* Service Worker — Dashboard Académico PWA
 *
 * Estrategias:
 *  - Navegación (HTML)   : network-first → cae al app shell cacheado → offline.html
 *  - API (/api/ GET)     : network-first → cae a la última respuesta cacheada
 *                          (esto permite ver los últimos datos del dashboard offline)
 *  - Assets estáticos    : stale-while-revalidate (rápido + se actualiza en segundo plano)
 *
 * Sube CACHE_VERSION cuando cambies este archivo para forzar la actualización.
 */

const CACHE_VERSION = "v1";
const SHELL_CACHE = `shell-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;
const ASSET_CACHE = `assets-${CACHE_VERSION}`;

// App shell mínimo que se precachea en la instalación
const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icons/icon.svg",
  "/icons/icon-maskable.svg",
];

// ─── Install: precache del app shell ─────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // addAll falla si algún recurso 404ea; usamos add individual tolerante
      Promise.allSettled(SHELL_ASSETS.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

// ─── Activate: limpiar caches viejos ─────────────────────────────────────────
self.addEventListener("activate", (event) => {
  const allowed = [SHELL_CACHE, API_CACHE, ASSET_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => !allowed.includes(k)).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Permite al frontend forzar la activación inmediata (botón "actualizar")
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

// ─── Helpers de estrategia ───────────────────────────────────────────────────

const isApiRequest = (url) => url.pathname.includes("/api/");

// network-first con fallback a caché (para API)
async function networkFirstApi(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const fresh = await fetch(request);
    // Solo cacheamos GET exitosos
    if (request.method === "GET" && fresh && fresh.status === 200) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Sin caché → respuesta JSON marcando que es offline
    return new Response(
      JSON.stringify({ ok: false, offline: true, msg: "Sin conexión y sin datos en caché" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

// network-first para navegación con fallback al shell / offline.html
async function navigationHandler(request) {
  try {
    const fresh = await fetch(request);
    return fresh;
  } catch {
    const cache = await caches.open(SHELL_CACHE);
    return (
      (await cache.match("/index.html")) ||
      (await cache.match("/")) ||
      (await cache.match("/offline.html")) ||
      new Response("Sin conexión", { status: 503 })
    );
  }
}

// stale-while-revalidate para assets
async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res && res.status === 200) cache.put(request, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || network;
}

// ─── Fetch ───────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // No interferir con métodos que no son GET (salvo API, que maneja su propio caso)
  if (isApiRequest(url)) {
    event.respondWith(networkFirstApi(request));
    return;
  }

  if (request.method !== "GET") return;

  // Navegación (carga de páginas)
  if (request.mode === "navigate") {
    event.respondWith(navigationHandler(request));
    return;
  }

  // Solo cacheamos assets del mismo origen
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
