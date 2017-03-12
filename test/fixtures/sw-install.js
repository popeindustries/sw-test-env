'use strict';

self.addEventListener('install', (evt) => {
  evt.waitUntil(self.caches.open('v1')
    .then((cache) => {
      return cache.addAll(['/index.js', '/index.css']);
    })
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(self.clients.claim());
});