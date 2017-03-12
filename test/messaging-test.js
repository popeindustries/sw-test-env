'use strict';

const { expect } = require('chai');
const { create, MessageChannel } = require('../index');

let sw;

describe('messaging', () => {
  beforeEach(() => {
    sw = create();
  });

  describe('unicast', () => {
    it('should send client message to ServiceWorker', () => {
      return sw.register('self.addEventListener("message", (evt) => self.message = evt.data)\n')
        .then((registration) => sw.ready)
        .then((registration) => {
          sw.controller.postMessage({ foo: 'foo' });
          expect(sw.scope.message).to.deep.equal({ foo: 'foo' });
        });
    });
    it('should send ServiceWorker reply to client', (done) => {
      sw.register('self.addEventListener("message", (evt) => evt.ports[0].postMessage({ foo: "bar" }))\n')
        .then((registration) => sw.ready)
        .then((registration) => {
          const mc = new MessageChannel();

          mc.port1.addEventListener('message', (evt) => {
            expect(evt.data).to.deep.equal({ foo: 'bar' });
            done();
          });
          sw.controller.postMessage({ foo: 'foo' }, [mc.port2]);
        });
    });
  });

  describe('broadcast', () => {
    it.skip('should send message to all connected clients', () => {
      const data = { foo: 'foo' };
      let count = 0;

      return sw.register('\n')
        .then((registration) => sw.ready)
        .then((registration) => sw.connect('/'))
        .then((sw) => {
          sw.addEventListener('message', (evt) => {
            count++;
            expect(evt.data).to.equal(data);
            expect(evt.source).to.equal(sw.controller);
            console.log('first', count)
            // expect(++count).to.equal(1);
          });
        })
        .then(() => sw.connect('/'))
        .then((sw) => {
          sw.addEventListener('message', (evt) => {
            count++;
            expect(evt.data).to.equal(data);
            expect(evt.source).to.equal(sw.controller);
            console.log('second', count)
            // expect(++count).to.equal(2);
          });
          sw.scope.clients.matchAll()
            .then((all) => {
              all.map((client) => client.postMessage(data));
            });
        });
    });
  });
});