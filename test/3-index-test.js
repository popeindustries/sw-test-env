import { connect, destroy } from '../sw-test-env.js';
import { expect } from 'chai';
import { testServer } from 'dvlp/dvlp-test.js';

/** @type { import('dvlp').TestServer } */
let fake;
/** @type { MockServiceWorkerContainer } */
let sw;

describe('sw-test-env', () => {
  before(() => {
    testServer.disableNetwork();
  });
  beforeEach(async () => {
    fake = await testServer({ autorespond: true, latency: 0, port: 3333 });
    sw = await connect('http://localhost:3333', 'test/fixtures');
  });
  afterEach(async () => {
    await fake.destroy();
    await destroy();
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
      expect(sw.controller).to.equal(undefined);
    });
  });

  describe('trigger()', () => {
    it('should trigger an install event', async () => {
      await sw.register('sw-empty.js');
      // @ts-ignore
      expect(sw._sw.state).to.equal('installing');
      await sw.trigger('install');
      // @ts-ignore
      expect(sw._sw.state).to.equal('installed');
      expect(sw.controller).to.equal(null);
    });
    it('should trigger an activate event', async () => {
      await sw.register('sw-empty.js');
      await sw.trigger('install');
      // @ts-ignore
      expect(sw._sw.state).to.equal('installed');
      await sw.trigger('activate');
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
    it('should trigger a ServiceWorker fetch handler', async () => {
      await sw.register('sw-fetch.js');
      await sw.trigger('install');
      await sw.trigger('activate');
      const response = await sw.trigger('fetch', { request: '/index.js' });
      expect(response.status).to.equal(200);
    });
    it('should trigger a ServiceWorker on* handler', async () => {
      await sw.register('sw-oninstall.js');
      await sw.trigger('install');
      expect(sw.scope.installed).to.equal(true);
    });
    it('should trigger a ServiceWorker event handler with waitUntil()', async () => {
      await sw.register('sw-install-wait-until.js');
      await sw.trigger('install');
      expect(sw.scope.installed).to.equal(true);
    });
    it('should trigger a handled error event', async () => {
      await sw.register('sw-error.js');
      const err = Error('ooops!');
      const resolvedErr = await sw.trigger('error', err);
      expect(sw.scope.message).to.equal('ooops!');
      expect(err).to.equal(resolvedErr);
    });
    it('should trigger an unhandled error event', async () => {
      await sw.register('sw-empty.js');
      try {
        await sw.trigger('error', Error('ooops!'));
        expect(true).to.not.exist;
      } catch (err) {
        expect(err).to.have.property('message', 'ooops!');
      }
    });
  });

  describe('ready', () => {
    it('should execute install/activate lifecyle', async () => {
      await sw.register('sw-install-activate.js');
      await sw.ready;
      expect(sw.controller?.state).to.equal('activated');
      expect(sw.scope.installed).to.equal(true);
      expect(sw.scope.activated).to.equal(true);
    });
    it('should ignore existing install/activate lifecyle', async () => {
      await sw.register('sw-install-activate.js');
      await sw.trigger('install');
      await sw.ready;
      expect(sw.controller?.state).to.equal('activated');
      expect(sw.scope.installed).to.equal(true);
      expect(sw.scope.activated).to.equal(true);
    });
    it('should execute install/activate lifecyle for multiple connected pages', async () => {
      const sw2 = await connect();
      await sw.register('sw-install-activate.js');
      await sw.ready;
      expect(sw.controller?.state).to.equal('activated');
      // @ts-ignore
      expect(sw2._sw.state).to.equal('activated');
      expect(sw.scope.installed).to.equal(true);
      expect(sw2.scope.activated).to.equal(true);
      expect(await sw.scope.clients.matchAll()).to.have.length(2);
    });
    it('should install and cache assets', async () => {
      await sw.register('sw-install-precache-activate.js');
      await sw.ready;
      expect(sw.controller?.state).to.equal('activated');
      const urls = (await (await sw.scope.caches.open('v1')).keys()).map((req) => req.url);
      expect(urls).to.have.length(2);
      expect(urls).to.include('http://localhost:3333/index.css');
      expect(urls).to.include('http://localhost:3333/index.js');
    });
  });
});
