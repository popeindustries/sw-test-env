'use strict';

const { mixin } = require('./events');
const CacheStorage = require('./CacheStorage');
const Clients = require('./Clients');

module.exports = class ServiceWorkerGlobalScope {
  /**
   * Constructor
   * @param {ServiceWorkerRegistration} registration
   * @param {Function} fetch
   * @param {Function} postMessage
   */
  constructor (registration, fetch, postMessage) {
    this.registration = registration;
    this.caches = new CacheStorage(fetch);
    this.clients = new Clients(postMessage);

    mixin(this);
  }

  /**
   * Force active
   * @returns {Promise}
   */
  skipWaiting () {
    return Promise.resolve();
  }

  _destroy () {
    this.caches._destroy();
    this.clients._destroy();
    this._listeners = {};
  }
};