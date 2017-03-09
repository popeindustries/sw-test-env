'use strict';

const CacheStorage = require('./CacheStorage');
const Clients = require('./Clients');
const Registration = require('./ServiceWorkerRegistration');

module.exports = class ServiceWorker {
  /**
   * Constructor
   */
  constructor () {
    this.caches = new CacheStorage();
    // this.clients = new Clients();
    this.listeners = {};
    this.registration = new Registration();
    this.self = this;
  }

  /**
   * Register listener 'fn' for 'event'
   * @param {String} event
   * @param {Function} fn
   */
  addEventListener (event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
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
    this.registration.unregister();
    this.listeners = {};
  }
};