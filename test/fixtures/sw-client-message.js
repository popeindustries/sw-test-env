// @ts-nocheck

self.addEventListener('message', (evt) => {
  self.message = evt.data;
});
