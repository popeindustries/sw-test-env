// @ts-nocheck

self.oninstall = (evt) => {
  evt.waitUntil(
    self.skipWaiting().then(() => {
      self.installed = true;
    }),
  );
};
