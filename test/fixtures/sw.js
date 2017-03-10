'use strict';

self.addEventListener('install', (evt) => {
  self.foo = 'foo';
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(new Promise((resolve) => {
    self.bar = 'bar';
    setTimeout(resolve, 100);
  }));
});