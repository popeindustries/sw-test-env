// @ts-nocheck

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    self.skipWaiting().then(() => {
      self.installed = true;
    }),
  );
});
