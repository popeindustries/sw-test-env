'use strict';

const { expect } = require('chai');
const { evalScript, loadModule } = require('../index');

describe('PseudoServiceWorker', () => {
  describe('evalScript()', () => {
    it('should', () => {
      const sw = evalScript('console.log(require.resolve("./Cache-test.js"));\nself.foo = "foo"');
      console.log(sw.foo)
      console.log(global.foo)
    });
  });

  describe('loadModule', () => {
    it('should', () => {
      const module = loadModule(require.resolve('./fixtures/module.js'));
      console.log(module.foo())
    });
  });
});