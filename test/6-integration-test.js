'use strict';

const { expect } = require('chai');
const { connect, destroy } = require('../index');

let sw;

if (process.version.charAt(1) === '8') {
  describe('workbox-sw', () => {
    beforeEach(done => {
      connect('http://localhost:3333').then(serviceWorker => {
        sw = serviceWorker;
        done();
      });
    });
    afterEach(() => {
      destroy();
    });

    it('should initialize a workbox instance', () => {
      return sw.register('test/fixtures/sw-workbox.js').then(registration => {
        expect(sw.scope.workboxSW).to.have.property('_router');
      });
    });
  });
}
