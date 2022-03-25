// @ts-nocheck
self.addEventListener('fetch', (evt) => {
  evt.respondWith(fetch(evt.request));
});
