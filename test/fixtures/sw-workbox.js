importScripts('node_modules/workbox-sw/build/importScripts/workbox-sw.prod.v2.0.1.js');

self.workboxSW = new WorkboxSW({
  clientsClaim: true,
  skipWaiting: true,
});

