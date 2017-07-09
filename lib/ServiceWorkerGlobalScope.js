'use strict';

const { mixin } = require('./events');
const CacheStorage = require('./CacheStorage');
const Clients = require('./Clients');

module.exports = class ServiceWorkerGlobalScope {
  static [Symbol.hasInstance](instance) {
    return instance.registration && instance.caches && instance.clients;
  }
  /**
   * Constructor
   * @param {ServiceWorkerRegistration} registration
   * @param {Function} fetch
   */
  constructor(registration, fetch) {
    this.registration = registration;
    this.caches = new CacheStorage(fetch);
    this.clients = new Clients();

    mixin(this);
  }

  /**
   * Force active
   * @returns {Promise}
   */
  skipWaiting() {
    return Promise.resolve();
  }

  _destroy() {
    this.caches._destroy();
    this.clients._destroy();
    this._listeners = {};
  }
};
