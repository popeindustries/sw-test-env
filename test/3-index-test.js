import { connect, destroy } from '../src/index.js';
import { expect } from 'chai';
import { testServer } from 'dvlp/dvlp-test.js';

/** @type { import('dvlp').TestServer } */
let fake;
/** @type { import('../src/api/ServiceWorkerContainer' ).default } */
let sw;

describe('sw-test-env', () => {
  before(() => {
    testServer.disableNetwork();
  });
  beforeEach(async () => {
    fake = await testServer({ autorespond: true, port: 3333 });
    sw = await connect('http://localhost:3333', 'test/fixtures');
  });
  afterEach(() => {
    destroy();
  });
  after(() => {
    testServer.enableNetwork();
  });

  describe('register()', () => {
    it('should execute script path in ServiceWorker context', async () => {
      const registration = await sw.register('sw-empty.js');
      expect(registration.scope).to.equal('http://localhost:3333/');
      expect(sw.scope.caches).to.exist;
    });
    it('should define "location" object in ServiceWorker context', async () => {
      await sw.register('sw-empty.js');
      expect(sw.scope.location).to.have.property('href', 'http://localhost:3333/sw-empty.js');
    });
    it('should not allow "importScripts()"', async () => {
      try {
        await sw.register('sw-import-scripts.js');
        expect(true).to.be.false;
      } catch (err) {
        expect(err).to.exist;
        expect(err).to.have.property(
          'message',
          '"importScripts" not supported in esm ServiceWorker. Use esm "import" statement instead',
        );
      }
    });
  });

  describe('unregister()', () => {
    it('should unregister a registered ServiceWorker context', async () => {
      const registration = await sw.register('sw-empty.js');
      const success = await registration.unregister();
      expect(success).to.equal(true);
      expect(sw._sw).to.equal(undefined);
    });
  });

  describe('trigger()', () => {
    it('should trigger an install event', async () => {
      await sw.register('sw-empty.js');
      expect(sw._sw.state).to.equal('installing');
      await sw.trigger('install');
      expect(sw._sw.state).to.equal('installed');
      expect(sw.controller).to.equal(null);
    });
    it('should trigger an activate event', async () => {
      await sw.register('sw-empty.js');
      await sw.trigger('install');
      expect(sw._sw.state).to.equal('installed');
      await sw.trigger('activate');
      expect(sw._sw.state).to.equal('activated');
      expect(sw.controller).to.have.property('state', 'activated');
    });
    it('should throw when invalid state while triggering an event', async () => {
      await sw.register('sw-empty.js');
      try {
        await sw.trigger('fetch');
      } catch (err) {
        expect(err).to.to.have.property('message', 'ServiceWorker not yet active');
      }
    });
    it('should trigger a ServiceWorker event handler', async () => {
      await sw.register('sw-install.js');
      await sw.trigger('install');
      expect(sw.scope.installed).to.equal(true);
    });
    it.only('should trigger a ServiceWorker fetch handler', async () => {
      await sw.register('sw-fetch.js');
      await sw.trigger('install');
      await sw.trigger('activate');
      const response = await sw.trigger('fetch', { request: '/index.js' });
      expect(response.status).to.equal(200);
    });
    it('should trigger a ServiceWorker on* handler', () => {
      return sw
        .register('self.oninstall = (evt) => self.foo = "foo";\n')
        .then((registration) => sw.trigger('install'))
        .then(() => {
          expect(sw.scope.foo).to.equal('foo');
        });
    });
    it('should trigger a ServiceWorker event handler with waitUntil()', () => {
      return sw
        .register(
          'self.addEventListener("install", (evt) => evt.waitUntil(new Promise((resolve) => { self.foo = "foo"; resolve()})));\n',
        )
        .then((registration) => sw.trigger('install'))
        .then(() => {
          expect(sw.scope.foo).to.equal('foo');
        });
    });
    it('should trigger a handled error event', () => {
      return sw
        .register('self.onerror = (evt) => self.error = evt.message;\n')
        .then((registration) => sw.trigger('error', Error('foo!')))
        .catch((err) => {
          expect(self.message).to.equal('foo!');
        });
    });
    it('should trigger an unhandled error event', () => {
      return sw
        .register('self.foo = "foo"\n')
        .then((registration) => sw.trigger('error', Error('foo!')))
        .catch((err) => {
          expect(err.message).to.equal('foo!');
        });
    });
  });

  describe('ready', () => {
    it('should execute install/activate lifecyle', () => {
      return sw
        .register('test/fixtures/sw.js')
        .then((registration) => sw.ready)
        .then((registration) => {
          expect(sw._sw.state).to.equal('activated');
          expect(sw.scope.foo).to.equal('foo');
          expect(sw.scope.bar).to.equal('bar');
        });
    });
    it('should ignore existing install/activate lifecyle', () => {
      return sw
        .register('test/fixtures/sw.js')
        .then((registration) => sw.trigger('install'))
        .then((registration) => sw.ready)
        .then((registration) => {
          expect(sw._sw.state).to.equal('activated');
          expect(sw.scope.foo).to.equal('foo');
          expect(sw.scope.bar).to.equal('bar');
        });
    });
    it('should execute install/activate lifecyle for multiple connected pages', () => {
      return connect().then((sw2) => {
        return sw
          .register('test/fixtures/sw.js')
          .then((registration) => sw.ready)
          .then((registration) => {
            expect(sw._sw.state).to.equal('activated');
            expect(sw2._sw.state).to.equal('activated');
            expect(sw.scope.foo).to.equal('foo');
            expect(sw2.scope.bar).to.equal('bar');
            expect(sw.scope.clients._clients.length).to.equal(2);
          });
      });
    });
    it('should install and cache assets', () => {
      fake.get('/index.js').reply(200).get('/index.css').reply(200);
      return sw
        .register('test/fixtures/sw-install.js')
        .then((registration) => sw.ready)
        .then((registration) => {
          const urls = Array.from(sw.scope.caches._caches.get('v1')._items.keys()).map((req) => req.url);

          expect(sw._sw.state).to.equal('activated');
          expect(urls).to.deep.equal(['http://localhost:3333/index.js', 'http://localhost:3333/index.css']);
        });
    });
  });
});
