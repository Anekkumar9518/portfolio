/* Anek Kumar portfolio: offline support for the installed app.
   Network first so visitors always get the latest version when online;
   the cache is only a fallback when offline. */
const CACHE = "ak-v1";
const CORE = ["./", "index.html", "assets/css/style.css", "assets/css/phone.css", "assets/css/extras.css", "assets/css/responsive.css",
  "assets/css/human.css", "assets/css/studio.css", "assets/css/android.css", "assets/css/fun.css", "assets/js/main.js", "assets/js/extras.js",
  "assets/js/android.js", "assets/js/android-apps.js", "assets/js/fun.js", "favicon.svg", "assets/img/icon-192.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then((res) => {
    if (res.ok && res.type === "basic") { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then((r) => r || (req.mode === "navigate" ? caches.match("index.html") : Response.error()))));
});
