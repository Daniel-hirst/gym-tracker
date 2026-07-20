// Service worker: network-first so the app always launches on the latest deploy,
// with a cache fallback so it still opens fully offline at the gym.
const CACHE = "gym-tracker-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Hashed build assets never change content — serve from cache, fetch once
  if (url.pathname.includes("/assets/")) {
    e.respondWith(
      caches.open(CACHE).then(async (c) => {
        const hit = await c.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) c.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  // HTML / manifest / icons: network-first (bypassing the HTTP cache, which iOS
  // home-screen apps hold onto far too long), cache as the offline fallback
  e.respondWith(
    (async () => {
      const c = await caches.open(CACHE);
      try {
        const res = await fetch(req, { cache: "no-cache" });
        if (res.ok) c.put(req, res.clone());
        return res;
      } catch {
        const hit = await c.match(req);
        if (hit) return hit;
        return Response.error();
      }
    })()
  );
});
