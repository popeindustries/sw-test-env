'use strict';

const { expect } = require('chai');
const { connect, destroy } = require('../src/index');
const nock = require('nock');

let fake, sw;

describe('Context', () => {
  beforeEach((done) => {
    connect('http://localhost:3333').then((serviceWorker) => {
      sw = serviceWorker;
      done();
    });
  });
  afterEach(() => {
    destroy();
  });

  describe('FormData', () => {
    it('exists in the context', () => {
      return sw
        .register('self.foo = new FormData()\n')
        .then((registration) => sw.ready)
        .then((registration) => {
          expect(sw._sw.state).to.equal('activated');
          expect(sw.scope.foo).to.not.be.null;
        });
    });
  });
});
