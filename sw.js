/* Eva Oyunlar — service worker: tam offline önbellek */
const VERSION = "eva-v1.0.0";
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
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
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
