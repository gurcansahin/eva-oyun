/* Eva Oyunlar — service worker: tam offline önbellek */
const VERSION = "eva-v1.6.2";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./assets/css/common.css",
  "./assets/js/audio.js",
  "./assets/js/ui.js",
  "./market/index.html",
  "./market/style.css",
  "./market/game.js",
  "./hayvan/index.html",
  "./hayvan/style.css",
  "./hayvan/game.js",
  "./muzik/index.html",
  "./muzik/style.css",
  "./muzik/game.js",
  "./matematik/index.html",
  "./matematik/style.css",
  "./matematik/game.js",
  "./akademi/index.html",
  "./akademi/style.css",
  "./akademi/game.js",
  "./yakala/index.html",
  "./yakala/style.css",
  "./yakala/game.js",
  "./temizle.html",
  "./assets/sounds/ari.mp3",
  "./assets/sounds/aslan.mp3",
  "./assets/sounds/at.mp3",
  "./assets/sounds/cita.mp3",
  "./assets/sounds/fil.mp3",
  "./assets/sounds/inek.mp3",
  "./assets/sounds/kedi.mp3",
  "./assets/sounds/kopek.mp3",
  "./assets/sounds/kurbaga.mp3",
  "./assets/sounds/kus.mp3",
  "./assets/sounds/ordek.mp3",
  "./assets/sounds/tavuk.mp3",
  "./assets/sounds/yilan.mp3"
];

self.addEventListener("install", (e) => {
  // HTTP önbelleğini atla ve yönlendirilmiş yanıtları temizle:
  // yönlendirilmiş yanıt navigasyonda Chrome tarafından reddedilir (beyaz sayfa).
  e.waitUntil(
    caches.open(VERSION).then((c) =>
      Promise.all(ASSETS.map((url) =>
        fetch(url, { cache: "no-cache" }).then((r) => {
          if (!r.ok) throw new Error("cache fail: " + url);
          if (r.redirected) {
            return r.blob().then((b) => c.put(url, new Response(b, { status: 200, headers: r.headers })));
          }
          return c.put(url, r);
        })
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request))
  );
});
