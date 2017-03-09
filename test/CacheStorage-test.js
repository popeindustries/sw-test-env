'use strict';

const { expect } = require('chai');
const CacheStorage = require('../lib/CacheStorage');
const Request = require('../lib/Request');
const Response = require('../lib/Response');

let caches;

describe('CacheStorage', () => {
  beforeEach(() => {
    caches = new CacheStorage();
  });
  afterEach(() => {
    caches._destroy();
  });

  describe('open()', () => {
    it('should create new cache instance if it doesn\'t exist', () => {
      return caches.open('foo')
        .then((cache) => {
          expect(cache).to.have.property('name', 'foo');
          expect(caches.caches.size).to.equal(1);
        });
    });
    it('should return existing cache instance', () => {
      return caches.open('foo')
        .then((cache) => caches.open('foo'))
        .then((cache) => {
          expect(cache).to.have.property('name', 'foo');
          expect(caches.caches.size).to.equal(1);
        });
    });
  });

  describe('match()', () => {
    it('should resolve with "undefined" if no match', () => {
      return caches.match(new Request('foo.js'))
        .then((response) => {
          expect(response).to.equal(undefined);
        });
    });
    it('should resolve with response if match', () => {
      const req = new Request('foo.js');
      const res = new Response('foo');

      return caches.open('foo')
        .then((cache) => cache.put(req, res))
        .then(() => caches.match(req))
        .then((response) => {
          expect(response).to.equal(res);
        });
    });
    it('should resolve with response if match and "options.cacheName"', () => {
      const req = new Request('foo.js');
      const res = new Response('foo');

      return caches.open('foo')
        .then((cache) => cache.put(req, res))
        .then(() => caches.match(req, { cacheName: 'foo' }))
        .then((response) => {
          expect(response).to.equal(res);
        });
    });
    it('should reject if passed "options.cacheName" doesn\'t exist', (done) => {
      caches.match(new Request('foo.js'), { cacheName: 'foo' })
        .catch((err) => {
          expect(err.message).to.equal('cache with name \'foo\' not found');
          done();
        });
    });
  });

  describe('has()', () => {
    it('should resolve with "false" if cache doesn\'t exist', () => {
      return caches.has('foo')
        .then((success) => {
          expect(success).to.equal(false);
        });
    });
    it('should resolve with "true" if cache exists', () => {
      return caches.open('foo')
        .then((cache) => caches.has('foo'))
        .then((success) => {
          expect(success).to.equal(true);
        });
    });
  });

  describe('keys()', () => {
    it('should resolve with an empty array if no caches', () => {
      return caches.keys()
        .then((keys) => {
          expect(keys).to.deep.equal([]);
        });
    });
    it('should resolve with an array of cache keys', () => {
      return caches.open('foo')
        .then((cache) => caches.keys())
        .then((keys) => {
          expect(keys).to.deep.equal(['foo']);
        });
    });
  });

  describe('delete()', () => {
    it('should resolve with "false" if no caches', () => {
      return caches.delete('foo')
        .then((success) => {
          expect(success).to.equal(false);
        });
    });
    it('should resolve with "true" if successfully removed', () => {
      return caches.open('foo')
        .then((cache) => caches.delete('foo'))
        .then((success) => {
          expect(success).to.equal(true);
        });
    });
  });
});