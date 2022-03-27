// @ts-nocheck

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    self.skipWaiting().then(() => {
      self.installed = true;
    }),
  );
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    self.clients.claim().then(() => {
      self.activated = true;
    }),
  );
});
