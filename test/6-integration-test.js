'use strict';

const { expect } = require('chai');
const { connect, destroy } = require('../index');
const nock = require('nock');
const path = require('path');

let fake, sw;

describe('workbox-sw', () => {
  before(() => {
    nock.disableNetConnect();
    nock.enableNetConnect('localhost');
  });
  beforeEach(() => {
    fake = nock('http://localhost:3333', { encodedQueryParams: true });
    sw = connect('http://localhost:3333', process.cwd());
  });
  afterEach(() => {
    nock.cleanAll();
    destroy();
  });
  after(() => {
    nock.enableNetConnect();
  });

  it.only('should', () => {
    return sw.register('./fixtures/sw-workbox.js').then(registration => {
    });
  });
});
