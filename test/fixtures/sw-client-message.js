// @ts-nocheck

self.addEventListener('message', (evt) => {
  console.log(evt);
  self.message = evt.data;
});
