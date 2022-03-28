import { connect, destroy, MessageChannel } from '../sw-test-env.js';
import { expect } from 'chai';

/** @type { MockServiceWorkerContainer } */
let sw;

describe('messaging', () => {
  beforeEach(async () => {
    sw = await connect('http://localhost:3333', 'test/fixtures');
  });
  afterEach(() => {
    destroy();
  });

  describe('unicast', () => {
    it('should send client message to ServiceWorker', async () => {
      await sw.register('sw-client-message.js');
      await sw.ready;
      sw.controller?.postMessage({ foo: 'foo' });
      expect(sw.scope.message).to.deep.equal({ foo: 'foo' });
    });
    it('should send ServiceWorker reply to client', (done) => {
      sw.register('sw-message.js')
        .then(() => sw.ready)
        .then(() => {
          const mc = new MessageChannel();
          mc.port1.addEventListener('message', (evt) => {
            expect(/** @type { MessageEvent } */ (evt).data).to.deep.equal({ foo: 'bar' });
            done();
          });
          sw.controller?.postMessage({ foo: 'foo' }, [mc.port2]);
        });
    });
    it('should send ServiceWorker reply to client with onmessage', (done) => {
      sw.register('sw-message.js')
        .then(() => sw.ready)
        .then(() => {
          const mc = new MessageChannel();
          mc.port1.onmessage = (evt) => {
            expect(evt.data).to.deep.equal({ foo: 'bar' });
            done();
          };
          sw.controller?.postMessage({ foo: 'foo' }, [mc.port2]);
        });
    });
  });

  describe('broadcast', () => {
    it('should send message to all connected clients', (done) => {
      const data = { foo: 'foo' };
      let count = 0;
      /** @type { MockServiceWorkerContainer } */
      let sw2;

      connect('http://localhost:3333', 'test/fixtures')
        .then((s) => {
          sw2 = s;
          return sw.register('sw-empty.js');
        })
        .then(() => sw.ready)
        .then(() => {
          sw.addEventListener('message', (evt) => {
            const { data, source } = /** @type { MessageEvent } */ (evt);
            count++;
            expect(data).to.equal(data);
            expect(source).to.equal(sw.controller);
            expect(count).to.equal(1);
          });
          sw2.onmessage = (evt) => {
            const { data, source } = /** @type { MessageEvent } */ (evt);
            count++;
            expect(data).to.equal(data);
            expect(source).to.equal(sw2.controller);
            expect(count).to.equal(2);
            done();
          };
          sw.scope.clients.matchAll().then((all) => {
            all.forEach((client) => client.postMessage(data));
          });
        });
    });
  });
});
