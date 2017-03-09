'use strict';

const { expect } = require('chai');
const Cache = require('../lib/Cache');
const nock = require('nock');
const Request = require('../lib/Request');
const Response = require('../lib/Response');

let cache, fake;

describe('Cache', () => {
  before(() => {
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
  });
  beforeEach(() => {
    fake = nock('http://127.0.0.1:4000', { encodedQueryParams: true });
    cache = new Cache('test');
  });
  afterEach(() => {
    nock.cleanAll();
    cache._destroy();
  });
  after(() => {
    nock.enableNetConnect();
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
    it('should fetch and store a request url', () => {
      fake
        .get('/foo')
        .reply(200, { foo: 'foo' });

      return cache
        .add('http://127.0.0.1:4000/foo')
        .then(() => {
          expect(cache.items.size).to.equal(1);
        });
    });
    it('should fetch and store a request', () => {
      fake
        .get('/foo')
        .reply(200, { foo: 'foo' });

      const req = new Request('http://127.0.0.1:4000/foo');

      return cache
        .add(req)
        .then(() => cache.items.get(req).json())
        .then((body) => {
          expect(body).to.deep.equal({ foo: 'foo' });
        });
    });
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