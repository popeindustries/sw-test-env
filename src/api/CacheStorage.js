import Cache from './Cache.js';

/**
 * @implements MockCacheStorage
 */
export default class CacheStorage {
  /**
   * Constructor
   * @param { string } origin
   */
  constructor(origin) {
    this._caches = new Map();
    this._origin = origin;
  }

  /**
   * Determine if cache with 'cacheName' exists
   * @param { string } cacheName
   * @returns { Promise<boolean> }
   */
  has(cacheName) {
    return Promise.resolve(this._caches.has(cacheName));
  }

  /**
   * Open cache with 'cacheName'
   * Create if it doesn't exist
   * @param { string } cacheName
   * @returns { Promise<Cache> }
   */
  open(cacheName) {
    let cache = this._caches.get(cacheName);

    if (!cache) {
      cache = new Cache(cacheName, this._origin);
      this._caches.set(cacheName, cache);
    }

    return Promise.resolve(cache);
  }

  /**
   * Retrieve 'response' for matching 'request'
   * @param { import('node-fetch').Request | string } request
   * @param { CacheQueryOptions & { cacheName?: string } } [options]
   * @returns { Promise<import('node-fetch').Response | undefined> }
   */
  match(request, options = {}) {
    if (options.cacheName) {
      const cache = this._caches.get(options.cacheName);

      if (!cache) {
        return Promise.reject(Error(`cache with name '${options.cacheName}' not found`));
      }
      return cache.match(request, options);
    }

    for (const cache of this._caches.values()) {
      const results = cache._match(request, options);

      if (results.length) {
        return Promise.resolve(results[0][1]);
      }
    }

    return Promise.resolve(undefined);
  }

  /**
   * Retrieve all cache names
   * @returns { Promise<Array<string>> }
   */
  keys() {
    return Promise.resolve(Array.from(this._caches.keys()));
  }

  /**
   * Delete cache with 'cacheName'
   * @param { string } cacheName
   * @returns { Promise<boolean> }
   */
  delete(cacheName) {
    return Promise.resolve(this._caches.delete(cacheName));
  }

  _destroy() {
    this._caches.clear();
  }
}
