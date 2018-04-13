'use strict';

const { expect } = require('chai');
const { connect, destroy } = require('../index');
const nock = require('nock');

let fake, sw;

describe('sw-test-env', () => {
  before(() => {
    nock.disableNetConnect();
    nock.enableNetConnect('localhost');
  });
  beforeEach((done) => {
    fake = nock('http://localhost:3333', { encodedQueryParams: true });
    connect('http://localhost:3333').then((serviceWorker) => {
      sw = serviceWorker;
      done();
    });
  });
  afterEach(() => {
    nock.cleanAll();
    destroy();
  });
  after(() => {
    nock.enableNetConnect();
  });

  describe('register()', () => {
    it('should execute script in ServiceWorker context', () => {
      return sw.register('self.foo = "foo"\n').then((registration) => {
        expect(registration.scope).to.equal('http://localhost:3333/');
        expect(sw.scope.foo).to.equal('foo');
      });
    });
    it('should execute script in IIFE in ServiceWorker context', () => {
      return sw
        .register(
          '"use strict";\nvar $m = {};\n(function(){\n$m.foo = "foo";\nself.foo = $m.foo\n})()'
        )
        .then((registration) => {
          expect(sw.scope.foo).to.equal('foo');
        });
    });
    it('should execute script path in ServiceWorker context', () => {
      return sw.register('test/fixtures/script.js').then((registration) => {
        expect(sw.scope.foo).to.equal('foo');
      });
    });
    it('should execute module script in ServiceWorker context', () => {
      return sw.register('exports.foo = "foo"\n').then((registration) => {
        expect(sw.api.foo).to.equal('foo');
      });
    });
    it('should execute module script path in ServiceWorker context', () => {
      return sw.register('test/fixtures/module.js').then((registration) => {
        expect(sw.api.foo).to.equal('foo');
      });
    });
    it('should resolve relative requires while executing script in ServiceWorker context', () => {
      return sw.register('self.foo = require("./fixtures/foo")\n').then((registration) => {
        expect(sw.scope.foo).to.equal('foo');
      });
    });
    it('should resolve relative requires while executing module script in ServiceWorker context', () => {
      return sw.register('exports.foo = require("./fixtures/foo")\n').then((registration) => {
        expect(sw.api.foo).to.equal('foo');
      });
    });
    it('should resolve relative requires while executing module script as file in ServiceWorker context', () => {
      return sw.register('test/fixtures/dep.js').then((registration) => {
        expect(sw.api).to.equal('foo');
      });
    });
    it('should define "location" object in ServiceWorker context', () => {
      return sw.register('test/fixtures/script.js').then((registration) => {
        expect(sw.scope.location).to.have.property(
          'href',
          'http://localhost:3333/test/fixtures/script.js'
        );
      });
    });
    it('should enable "importScripts()"', () => {
      return sw
        .register('self.importScripts("test/fixtures/bar.js")\nfoo;')
        .then((registration) => {
          expect(sw.scope.bar).to.equal('bar');
        });
    });
    it('should enable "importScripts()" for multiple files', () => {
      return sw
        .register('importScripts("test/fixtures/bar.js", "test/fixtures/boo.js")\nfoo, bat')
        .then((registration) => {
          expect(sw.scope.bar).to.equal('bar');
          expect(sw.scope.boo).to.equal('boo');
        });
    });
  });

  describe('unregister()', () => {
    it('should unregister a registered ServiceWorker context', () => {
      return sw
        .register('self.foo = "foo"\n')
        .then((registration) => registration.unregister())
        .then((success) => {
          expect(success).to.equal(true);
          expect(sw._sw).to.equal(null);
        });
    });
  });

  describe('trigger()', () => {
    it('should trigger an install event', () => {
      return sw
        .register('self.foo = "foo"\n')
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
      return sw
        .register('self.foo = "foo"\n')
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
      return sw
        .register('self.foo = "foo"\n')
        .then((registration) => sw.trigger('fetch'))
        .catch((err) => {
          expect(err.message).to.equal('ServiceWorker not yet active');
        });
    });
    it('should trigger a ServiceWorker event handler', () => {
      return sw
        .register('self.addEventListener("install", (evt) => self.foo = "foo");\n')
        .then((registration) => sw.trigger('install'))
        .then(() => {
          expect(sw.scope.foo).to.equal('foo');
        });
    });
    it('should trigger a ServiceWorker fetch handler', () => {
      fake.get('/index.js').reply(200);
      return sw
        .register('self.addEventListener("fetch", (evt) => evt.respondWith(fetch(evt.request)));\n')
        .then((registration) => sw.trigger('install'))
        .then((result) => sw.trigger('activate'))
        .then((result) => sw.trigger('fetch', '/index.js'))
        .then((response) => {
          expect(response.status).to.equal(200);
        });
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
          'self.addEventListener("install", (evt) => evt.waitUntil(new Promise((resolve) => { self.foo = "foo"; resolve()})));\n'
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
      fake
        .get('/index.js')
        .reply(200)
        .get('/index.css')
        .reply(200);
      return sw
        .register('test/fixtures/sw-install.js')
        .then((registration) => sw.ready)
        .then((registration) => {
          const urls = Array.from(sw.scope.caches._caches.get('v1')._items.keys()).map(
            (req) => req.url
          );

          expect(sw._sw.state).to.equal('activated');
          expect(urls).to.deep.equal([
            'http://localhost:3333/index.js',
            'http://localhost:3333/index.css'
          ]);
        });
    });
  });
});
