// Service worker: network-first so the app always launches on the latest deploy,
// with a cache fallback so it still opens fully offline at the gym.
const CACHE = "gym-tracker-v1";
// On weak gym signal the network can stall rather than fail — give up after this and
// open from cache instead (the network response still refreshes the cache for next time)
const NETWORK_TIMEOUT_MS = 2500;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Drop cached bundles the fresh index.html no longer references, so a new copy of the
// app doesn't pile up in the cache with every weekly deploy
async function pruneAssets(c, html) {
  const live = new Set([...html.matchAll(/assets\/[^"'\s)]+/g)].map((m) => m[0]));
  for (const req of await c.keys()) {
    const path = new URL(req.url).pathname;
    const i = path.indexOf("assets/");
    if (i >= 0 && !live.has(path.slice(i))) await c.delete(req);
  }
}

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
  // home-screen apps hold onto far too long), cache as the offline / slow-signal fallback
  const network = (async () => {
    const res = await fetch(req, { cache: "no-cache" });
    if (res.ok) {
      const c = await caches.open(CACHE);
      await c.put(req, res.clone());
    }
    return res;
  })();
  e.waitUntil(network.catch(() => {}));

  e.respondWith(
    (async () => {
      const cached = () => caches.match(req);
      const timeout = new Promise((resolve) => setTimeout(resolve, NETWORK_TIMEOUT_MS, "timeout"));
      try {
        const res = await Promise.race([network, timeout]);
        if (res !== "timeout") {
          // Only prune when the fresh page is what's being served — if the cached page won
          // the race, it still needs its (older) bundle
          if (req.mode === "navigate" && res.ok) {
            await pruneAssets(await caches.open(CACHE), await res.clone().text()).catch(() => {});
          }
          return res;
        }
        const hit = await cached();
        return hit || (await network); // nothing cached yet — keep waiting for the network
      } catch {
        return (await cached()) || Response.error();
      }
    })()
  );
});
