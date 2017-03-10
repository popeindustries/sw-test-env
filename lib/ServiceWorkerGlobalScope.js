'use strict';

const CacheStorage = require('./CacheStorage');
const Clients = require('./Clients');

module.exports = class ServiceWorkerGlobalScope {
  /**
   * Constructor
   * @param {ServiceWorkerRegistration} registration
   * @param {Function} fetch
   */
  constructor (registration, fetch) {
    this.registration = registration;
    this.caches = new CacheStorage(fetch);
    this.clients = new Clients();

    this._listeners = {};
  }

  /**
   * Register listener 'fn' for 'event'
   * @param {String} event
   * @param {Function} fn
   */
  addEventListener (event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
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