'use strict';

const Cache = require('./Cache');

module.exports = class CacheStorage {
  constructor () {
    this.caches = new Map();
  }

  /**
   * Retrieve 'response' for matching 'request'
   * @param {Request} request
   * @param {Object} [options]
   *  - {Boolean} ignoreSearch
   *  - {Boolean} ignoreMethod
   *  - {Boolean} ignoreVary
   *  - {String} cacheName
   * @returns {Promise<Response>}
   */
  match (request, options = {}) {
    if (options.cacheName) {
      const cache = this.caches.get(options.cacheName);

      if (!cache) return Promise.reject(Error(`cache with name '${options.cacheName}' not found`));
      return cache.match(request, options);
    }

    for (const cache of this.caches.values()) {
      const results = cache._match(request, options);

      if (results.length) return Promise.resolve(results[0][1]);
    }

    return Promise.resolve(undefined);
  }

  /**
   * Determine if cache with 'cacheName' exists
   * @param {String} cacheName
   * @returns {Promise<Boolean>}
   */
  has (cacheName) {
    return Promise.resolve(this.caches.has(cacheName));
  }

  /**
   * Open cache with 'cacheName'
   * Create if it doesn't exist
   * @param {String} cacheName
   * @returns {Promise<Cache>}
   */
  open (cacheName) {
    let cache = this.caches.get(cacheName);

    if (!cache) {
      cache = new Cache(cacheName);
      this.caches.set(cacheName, cache);
    }

    return Promise.resolve(cache);
  }

  /**
   * Delete cache with 'cacheName'
   * @param {String} cacheName
   * @returns {Promise<Boolean>}
   */
  delete (cacheName) {
    return Promise.resolve(this.caches.delete(cacheName));
  }

  /**
   * Retrieve all cache names
   * @returns {Promise<Array>}
   */
  keys () {
    return Promise.resolve(Array.from(this.caches.keys()));
  }

  _destroy () {
    this.caches.clear();
  }
};