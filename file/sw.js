
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        'SUKASEHAT/',
        'SUKASEHAT/index.html',
        'SUKASEHAT/error.html',
        'SUKASEHAT/script.js'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match('/error.html'))
  );
});
