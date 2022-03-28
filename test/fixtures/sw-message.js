self.addEventListener('message', (evt) => {
  evt.ports[0].postMessage({ foo: 'bar' });
});
