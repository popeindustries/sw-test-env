'use strict';

const { expect } = require('chai');
const Cache = require('../lib/Cache');
const Request = require('../lib/Request');
const Response = require('../lib/Response');

describe('Cache', () => {
  let cache;

  beforeEach(() => {
    cache = new Cache('test');
  });
  afterEach(() => {
    cache._destroy();
  });

  describe('put()', () => {
    it('should store a request/response', () => {
      const req = new Request('foo.js');
      const res = new Response('foo');

      cache.put(req, res);
      expect(cache.items.has(req)).to.equal(true);
      expect(cache.items.get(req)).to.equal(res);
    });
    it('should overwrite an existing request/response', () => {
      const req1 = new Request('foo.js');
      const res1 = new Response('foo1');
      const req2 = new Request('foo.js');
      const res2 = new Response('foo2');

      cache.put(req1, res1);
      cache.put(req2, res2);
      expect(cache.items.has(req2)).to.equal(false);
      expect(cache.items.has(req1)).to.equal(true);
      expect(cache.items.get(req1)).to.equal(res2);
    });
    it('should not overwrite an existing request/response if different VARY header');
  });

  describe('add()', () => {

  });

  describe('addAll()', () => {

  });

  describe('match()', () => {

  });

  describe('matchAll()', () => {

  });

  describe('delete()', () => {

  });

  describe('keys()', () => {

  });
});