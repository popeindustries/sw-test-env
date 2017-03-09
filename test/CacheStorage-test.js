'use strict';

const { expect } = require('chai');
const CacheStorage = require('../lib/CacheStorage');
const nock = require('nock');
const Request = require('../lib/Request');
const Response = require('../lib/Response');

let caches, fake;

describe('CacheStorage', () => {
  before(() => {
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
  });
  beforeEach(() => {
    caches = new CacheStorage();
    fake = nock('http://127.0.0.1:4000', { encodedQueryParams: true });
  });
  afterEach(() => {
    nock.cleanAll();
  });
  after(() => {
    nock.enableNetConnect();
    caches._destroy();
  });

  describe('open()', () => {

  });

  describe('match()', () => {

  });

  describe('has()', () => {

  });

  describe('keys()', () => {

  });

  describe('delete()', () => {

  });
});