import { Request, Response } from 'node-fetch';
import Cache from '../src/api/Cache.js';
import CacheStorage from '../src/api/CacheStorage.js';
import { expect } from 'chai';
import { testServer } from 'dvlp/dvlp-test.js';

/** @type { Cache } */
let cache;
/** @type { CacheStorage } */
let caches;
/** @type { import('dvlp').TestServer } */
let fake;

describe('caching', () => {
  describe('Cache', () => {
    before(() => {
      testServer.disableNetwork();
    });
    beforeEach(async () => {
      fake = await testServer({ port: 3333 });
      cache = new Cache('test');
    });
    afterEach(() => {
      fake.destroy();
      cache._destroy();
    });
    after(() => {
      testServer.enableNetwork();
    });

    describe('put()', () => {
      it('should store a request/response', () => {
        const req = new Request('http://localhost:3333/foo.js');
        const res = new Response('foo');

        cache.put(req, res);
        expect(cache._items.has(req)).to.equal(true);
        expect(cache._items.get(req)).to.equal(res);
      });
      it('should overwrite an existing request/response', () => {
        const req1 = new Request('http://localhost:3333/foo.js');
        const res1 = new Response('foo1');
        const req2 = new Request('http://localhost:3333/foo.js');
        const res2 = new Response('foo2');

        cache.put(req1, res1);
        cache.put(req2, res2);
        expect(cache._items.has(req2)).to.equal(false);
        expect(cache._items.has(req1)).to.equal(true);
        expect(cache._items.get(req1)).to.equal(res2);
      });
      it('should not overwrite an existing request/response if different VARY header');
    });

    describe('add()', () => {
      it('should fetch and store a request url', () => {
        fake.mockResponse('/foo', { body: { foo: 'foo' } });

        return cache.add('http://localhost:3333/foo').then(() => {
          expect(cache._items.size).to.equal(1);
        });
      });
      it('should fetch and store a request', () => {
        fake.mockResponse('/foo', { body: { foo: 'foo' } });

        const req = new Request('http://localhost:3333/foo');

        return cache
          .add(req)
          .then(() => cache._items.get(req).json())
          .then((body) => {
            expect(body).to.deep.equal({ foo: 'foo' });
          });
      });
    });

    describe('addAll()', () => {
      it('should fetch and store multiple request urls', () => {
        fake.mockResponse('/foo', { body: { foo: 'foo' } });
        fake.mockResponse('/bar', { body: { bar: 'bar' } });

        return cache.addAll(['http://localhost:3333/foo', 'http://localhost:3333/bar']).then(() => {
          expect(cache._items.size).to.equal(2);
        });
      });
      it('should fetch and store multiple requests', () => {
        fake.mockResponse('/foo', { body: { foo: 'foo' } });
        fake.mockResponse('/bar', { body: { bar: 'bar' } });

        const req1 = new Request('http://localhost:3333/foo');
        const req2 = new Request('http://localhost:3333/bar');

        return cache
          .addAll([req1, req2])
          .then(() => Promise.all([cache._items.get(req1).json(), cache._items.get(req2).json()]))
          .then((bodies) => {
            expect(bodies[0]).to.deep.equal({ foo: 'foo' });
            expect(bodies[1]).to.deep.equal({ bar: 'bar' });
          });
      });
    });

    describe('match()', () => {
      it('should resolve with "undefined" if no match', () => {
        return cache.match(new Request('http://localhost:3333/foo.js')).then((response) => {
          expect(response).to.equal(undefined);
        });
      });
      it('should retrieve matching response', () => {
        const req = new Request('http://localhost:3333/foo.js');
        const res = new Response('foo');

        cache.put(req, res);
        return cache.match(req).then((response) => {
          expect(response).to.equal(res);
        });
      });
      it('should retrieve matching response when passed string request', () => {
        const req = new Request('http://localhost:3333/foo.js');
        const res = new Response('foo');

        cache.put(req, res);
        return cache.match('foo.js').then((response) => {
          expect(response).to.equal(res);
        });
      });
      it('should retrieve matching response, ignoring search query', () => {
        const req = new Request('http://localhost:3333/foo.js?q=foo');
        const res = new Response('foo');

        cache.put(req, res);
        return cache.match(new Request('http://localhost:3333/foo.js'), { ignoreSearch: true }).then((response) => {
          expect(response).to.equal(res);
        });
      });
      it('should retrieve matching response for fully qualified string request, ignoring search query', () => {
        const req = new Request('http://localhost:3333/foo.js?q=foo');
        const res = new Response('foo');

        cache.put(req, res);
        return cache.match('http://localhost:3333/foo.js', { ignoreSearch: true }).then((response) => {
          expect(response).to.equal(res);
        });
      });
      it('should retrieve matching response, ignoring method');
      it('should retrieve matching response, ignoring VARY header');
    });

    describe('matchAll()', () => {
      it('should resolve with empty array if no match', () => {
        return cache.matchAll('http://localhost:3333/foo.js').then((responses) => {
          expect(responses).to.deep.equal([]);
        });
      });
      it('should retrieve matching responses', () => {
        const req = new Request('http://localhost:3333/foo.js');
        const res = new Response('foo');

        cache.put(req, res);
        return cache.matchAll(req).then((responses) => {
          expect(responses[0]).to.equal(res);
        });
      });
      it('should retrieve matching responses, ignoring search query', () => {
        const req1 = new Request('http://localhost:3333/foo.js?q=foo');
        const res1 = new Response('foo');
        const req2 = new Request('http://localhost:3333/foo.js?q=bar');
        const res2 = new Response('bar');

        cache.put(req1, res1);
        cache.put(req2, res2);
        return cache.matchAll(req1, { ignoreSearch: true }).then((responses) => {
          expect(responses).to.have.length(2);
          expect(responses[0]).to.equal(res1);
          expect(responses[1]).to.equal(res2);
        });
      });
      it('should retrieve matching responses, ignoring method');
      it('should retrieve matching responses, ignoring VARY header');
    });

    describe('delete()', () => {
      it('should resolve with "false" if no match', () => {
        return cache.delete(new Request('http://localhost:3333/foo.js')).then((success) => {
          expect(success).to.equal(false);
        });
      });
      it('should remove matching request', () => {
        const req = new Request('http://localhost:3333/foo.js');
        const res = new Response('foo');

        cache.put(req, res);
        return cache.delete(req).then((success) => {
          expect(success).to.equal(true);
          expect(cache._items.size).to.equal(0);
        });
      });
      it('should remove matching requests, ignoring search query', () => {
        const req1 = new Request('http://localhost:3333/foo.js?q=foo');
        const res1 = new Response('foo');
        const req2 = new Request('http://localhost:3333/foo.js?q=bar');
        const res2 = new Response('bar');

        cache.put(req1, res1);
        cache.put(req2, res2);
        return cache.delete(req1, { ignoreSearch: true }).then((success) => {
          expect(success).to.equal(true);
          expect(cache._items.size).to.equal(0);
        });
      });
      it('should remove matching requests, ignoring method');
      it('should remove matching requests, ignoring VARY header');
    });

    describe('keys()', () => {
      it('should resolve with empty array if no cached items', () => {
        return cache.keys().then((results) => {
          expect(results).to.deep.equal([]);
        });
      });
      it('should resolve with all keys', () => {
        const req = new Request('http://localhost:3333/foo.js');
        const res = new Response('foo');

        cache.put(req, res);
        return cache.keys().then((results) => {
          expect(results).to.deep.equal([req]);
        });
      });
      it('should resolve with keys matching passed request', () => {
        const req = new Request('http://localhost:3333/foo.js');
        const res = new Response('foo');

        cache.put(req, res);
        return cache.keys(req).then((results) => {
          expect(results).to.deep.equal([req]);
        });
      });
      it('should resolve with keys matching passed request, ignoring search query', () => {
        const req1 = new Request('http://localhost:3333/foo.js?q=foo');
        const res1 = new Response('foo');
        const req2 = new Request('http://localhost:3333/foo.js?q=bar');
        const res2 = new Response('bar');

        cache.put(req1, res1);
        cache.put(req2, res2);
        return cache.keys(req1, { ignoreSearch: true }).then((results) => {
          expect(results).to.deep.equal([req1, req2]);
        });
      });
      it('should resolve with keys matching passed request, ignoring method');
      it('should resolve with keys matching passed request, ignoring VARY header');
    });
  });

  describe('CacheStorage', () => {
    beforeEach(() => {
      caches = new CacheStorage('http://localhost:3333/');
    });
    afterEach(() => {
      caches._destroy();
    });

    describe('open()', () => {
      it("should create new cache instance if it doesn't exist", () => {
        return caches.open('foo').then((cache) => {
          expect(cache).to.have.property('name', 'foo');
          expect(caches._caches.size).to.equal(1);
        });
      });
      it('should return existing cache instance', () => {
        return caches
          .open('foo')
          .then((cache) => caches.open('foo'))
          .then((cache) => {
            expect(cache).to.have.property('name', 'foo');
            expect(caches._caches.size).to.equal(1);
          });
      });
    });

    describe('match()', () => {
      it('should resolve with "undefined" if no match', () => {
        return caches.match(new Request('http://localhost:3333/foo.js')).then((response) => {
          expect(response).to.equal(undefined);
        });
      });
      it('should resolve with response if match', () => {
        const req = new Request('http://localhost:3333/foo.js');
        const res = new Response('foo');

        return caches
          .open('foo')
          .then((cache) => cache.put(req, res))
          .then(() => caches.match(req))
          .then((response) => {
            expect(response).to.equal(res);
          });
      });
      it('should resolve with response if match and "options.cacheName"', () => {
        const req = new Request('http://localhost:3333/foo.js');
        const res = new Response('foo');

        return caches
          .open('foo')
          .then((cache) => cache.put(req, res))
          .then(() => caches.match(req, { cacheName: 'foo' }))
          .then((response) => {
            expect(response).to.equal(res);
          });
      });
      it('should reject if passed "options.cacheName" doesn\'t exist', (done) => {
        caches.match(new Request('http://localhost:3333/foo.js'), { cacheName: 'foo' }).catch((err) => {
          expect(err.message).to.equal("cache with name 'foo' not found");
          done();
        });
      });
    });

    describe('has()', () => {
      it('should resolve with "false" if cache doesn\'t exist', () => {
        return caches.has('foo').then((success) => {
          expect(success).to.equal(false);
        });
      });
      it('should resolve with "true" if cache exists', () => {
        return caches
          .open('foo')
          .then((cache) => caches.has('foo'))
          .then((success) => {
            expect(success).to.equal(true);
          });
      });
    });

    describe('keys()', () => {
      it('should resolve with an empty array if no caches', () => {
        return caches.keys().then((keys) => {
          expect(keys).to.deep.equal([]);
        });
      });
      it('should resolve with an array of cache keys', () => {
        return caches
          .open('foo')
          .then((cache) => caches.keys())
          .then((keys) => {
            expect(keys).to.deep.equal(['foo']);
          });
      });
    });

    describe('delete()', () => {
      it('should resolve with "false" if no caches', () => {
        return caches.delete('foo').then((success) => {
          expect(success).to.equal(false);
        });
      });
      it('should resolve with "true" if successfully removed', () => {
        return caches
          .open('foo')
          .then((cache) => caches.delete('foo'))
          .then((success) => {
            expect(success).to.equal(true);
          });
      });
    });
  });
});
