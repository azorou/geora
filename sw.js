self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('geora-store').then((cache) => {
      return cache.addAll([
        './index.html',
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
        'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
