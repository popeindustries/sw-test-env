'use strict';

const { expect } = require('chai');
const { connect, destroy } = require('../index');

let sw;

describe('workbox-sw', () => {
  beforeEach(() => {
    sw = connect('http://localhost:3333', process.cwd());
  });
  afterEach(() => {
     destroy();
  });

  it('should initialize a workbox instance', () => {
    return sw.register('./fixtures/sw-workbox.js').then(registration => {
      expect(sw.scope.workboxSW).to.have.property('_router');
    });
  });
});
