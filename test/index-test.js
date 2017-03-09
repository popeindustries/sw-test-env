'use strict';

const { expect } = require('chai');
const pseudoServiceWorker = require('../index');

describe('pseudoServiceWorker', () => {
  it('should execute script in ServiceWorker context', () => {
    const { serviceWorker } = pseudoServiceWorker('self.foo = "foo"\n');

    expect(serviceWorker.foo).to.equal('foo');
  });
  it('should execute script path in ServiceWorker context', () => {
    const { serviceWorker } = pseudoServiceWorker('./fixtures/script.js');

    expect(serviceWorker.foo).to.equal('foo');
  });
  it('should execute module script in ServiceWorker context', () => {
    const { module } = pseudoServiceWorker('exports.foo = "foo"\n');

    expect(module.foo).to.equal('foo');
  });
  it('should execute module script path in ServiceWorker context', () => {
    const { module } = pseudoServiceWorker('./fixtures/module.js');

    expect(module.foo).to.equal('foo');
  });
  it('should resolve relative requires while executing script in ServiceWorker context', () => {
    const { serviceWorker } = pseudoServiceWorker('self.foo = require("./fixtures/foo")\n');

    expect(serviceWorker.foo).to.equal('foo');
  });
  it('should resolve relative requires while executing module script in ServiceWorker context', () => {
    const { module } = pseudoServiceWorker('exports.foo = require("./fixtures/foo")\n');

    expect(module.foo).to.equal('foo');
  });
});