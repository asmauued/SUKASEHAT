self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/',   
        '/index.html',
        '/error.html',
        '/script.js'
      ]);
    })
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match('/error.html'))
  );
});