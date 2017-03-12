'use strict';

const { expect } = require('chai');
const { create } = require('../index');
const nock = require('nock');

let fake, sw;

describe('sw-test-env', () => {
  before(() => {
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
  });
  beforeEach(() => {
    fake = nock('http://127.0.0.1:3333', { encodedQueryParams: true });
    sw = create();
  });
  afterEach(() => {
    nock.cleanAll();
  });
  after(() => {
    nock.enableNetConnect();
  });

  describe('register()', () => {
    it('should execute script in ServiceWorker context', () => {
      return sw.register('self.foo = "foo"\n')
        .then((registration) => {
          expect(sw.scope.foo).to.equal('foo');
        });
    });
    it('should execute script path in ServiceWorker context', () => {
      return sw.register('./fixtures/script.js')
        .then((registration) => {
          expect(sw.scope.foo).to.equal('foo');
        });
    });
    it('should execute module script in ServiceWorker context', () => {
      return sw.register('exports.foo = "foo"\n')
        .then((registration) => {
          expect(sw.api.foo).to.equal('foo');
        });
    });
    it('should execute module script path in ServiceWorker context', () => {
      return sw.register('./fixtures/module.js')
        .then((registration) => {
          expect(sw.api.foo).to.equal('foo');
        });
    });
    it('should resolve relative requires while executing script in ServiceWorker context', () => {
      return sw.register('self.foo = require("./fixtures/foo")\n')
        .then((registration) => {
          expect(sw.scope.foo).to.equal('foo');
        });
    });
    it('should resolve relative requires while executing module script in ServiceWorker context', () => {
      return sw.register('exports.foo = require("./fixtures/foo")\n')
        .then((registration) => {
          expect(sw.api.foo).to.equal('foo');
        });
    });
  });

  describe('trigger()', () => {
    it('should trigger an install event', () => {
      return sw.register('self.foo = "foo"\n')
        .then((registration) => {
          expect(sw._sw.state).to.equal('installing');
          return sw.trigger('install');
        })
        .then(() => {
          expect(sw._sw.state).to.equal('installed');
          expect(sw.controller).to.equal(null);
        });
    });
    it('should trigger an activate event', () => {
      return sw.register('self.foo = "foo"\n')
        .then((registration) => sw.trigger('install'))
        .then(() => {
          expect(sw._sw.state).to.equal('installed');
          return sw.trigger('activate');
        })
        .then(() => {
          expect(sw._sw.state).to.equal('activated');
          expect(sw.controller).to.have.property('state', 'activated');
        });
    });
    it('should throw when invalid state while triggering an event', () => {
      return sw.register('self.foo = "foo"\n')
        .then((registration) => sw.trigger('fetch'))
        .catch((err) => {
          expect(err.message).to.equal('ServiceWorker not yet active');
        });
    });
    it('should trigger a ServiceWorker event handler', () => {
      return sw.register('self.addEventListener("install", (evt) => self.foo = "foo");\n')
        .then((registration) => sw.trigger('install'))
        .then(() => {
          expect(sw.scope.foo).to.equal('foo');
        });
    });
    it('should trigger a ServiceWorker event handler with waitUntil()', () => {
      return sw.register('self.addEventListener("install", (evt) => evt.waitUntil(new Promise((resolve) => { self.foo = "foo"; resolve()})));\n')
        .then((registration) => sw.trigger('install'))
        .then(() => {
          expect(sw.scope.foo).to.equal('foo');
        });
    });
  });

  describe('ready', () => {
    it('should execute install/activate lifecyle', () => {
      return sw.register('./fixtures/sw.js')
        .then((registration) => sw.ready)
        .then((registration) => {
          expect(sw._sw.state).to.equal('activated');
          expect(sw.scope.foo).to.equal('foo');
          expect(sw.scope.bar).to.equal('bar');
        });
    });
    it('should install and cache assets', () => {
      fake
        .get('/index.js')
        .reply(200)
        .get('/index.css')
        .reply(200);
      return sw.register('./fixtures/sw-install.js')
        .then((registration) => sw.ready)
        .then((registration) => {
          const urls = Array.from(sw.scope.caches._caches.get('v1')._items.keys()).map((req) => req.url);

          expect(sw._sw.state).to.equal('activated');
          expect(urls).to.deep.equal(['/index.js', '/index.css']);
        });
    });
  });
});