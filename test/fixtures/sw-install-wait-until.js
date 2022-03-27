// @ts-nocheck

self.addEventListener('install', (evt) =>
  evt.waitUntil(
    new Promise((resolve) => {
      self.installed = true;
      resolve();
    }),
  ),
);
