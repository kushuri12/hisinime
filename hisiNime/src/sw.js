self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("hisinime-v1").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./css/index.css",
        "./src/home.js",
        "./icon_192.png",
        "./icon_512.png",
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
