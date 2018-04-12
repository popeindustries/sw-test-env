/* eslint-disable no-undef */
importScripts('node_modules/workbox-sw/build/workbox-sw.js');

workbox.core.setCacheNameDetails({
  prefix: 'my-app',
  suffix: 'v1'
});

self.wbx = workbox;
