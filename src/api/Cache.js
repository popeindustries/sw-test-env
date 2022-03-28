import fetch, { Request } from 'node-fetch';

/**
 * @implements MockCache
 */
export default class Cache {
  /**
   * Constructor
   * @param { string } cacheName
   * @param { string } origin
   */
  constructor(cacheName, origin = 'http://localhost:3333') {
    this.name = cacheName;

    this._items = new Map();
    this._origin = origin;
  }

  /**
   * Retrieve 'response' for matching 'request'
   * @param { import('node-fetch').Request | string } request
   * @param { CacheQueryOptions } [options]
   * @returns { Promise<import('node-fetch').Response | undefined> }
   */
  match(request, options = {}) {
    const results = this._match(request, options);

    return Promise.resolve(results.length ? results[0][1] : undefined);
  }

  /**
   * Retrieve one or more 'response's for matching 'request'
   * @param { import('node-fetch').Request | string } request
   * @param { CacheQueryOptions } [options]
   * @returns { Promise<Array<import('node-fetch').Response>> } resolves with Array of Responses
   */
  matchAll(request, options = {}) {
    const results = this._match(request, options);

    return Promise.resolve(results.map((result) => result[1]));
  }

  /**
   * Fetch and store a 'request'
   * @param { import('node-fetch').Request | string } request
   * @returns { Promise<void> }
   */
  add(request) {
    request = this._normalizeRequest(request);

    return fetch(request.url).then((response) => {
      if (!response.ok) {
        throw new TypeError('bad response status');
      }
      // @ts-ignore
      return this.put(request, response);
    });
  }

  /**
   * Fetch and store one or more 'request's
   * @param { Array<import('node-fetch').Request | string> } requests
   * @returns { Promise<Array<void>> } resolves with Array of void
   */
  addAll(requests) {
    return Promise.all(requests.map((request) => this.add(request)));
  }

  /**
   * Store 'response' keyed by 'request'
   * @param { import('node-fetch').Request | string } request
   * @param { import('node-fetch').Response } response
   * @returns { Promise<void> }
   */
  put(request, response) {
    // Allow duplicates if different VARY headers
    const existing = this._match(request, { ignoreVary: true })[0];

    if (existing) {
      request = existing[0];
    }
    request = this._normalizeRequest(request);
    this._items.set(request, response);
    return Promise.resolve();
  }

  /**
   * Remove 'response' matching 'request'
   * @param { import('node-fetch').Request | string } request
   * @param { CacheQueryOptions } [options]
   * @returns { Promise<Boolean> } resolves with 'true' if deleted
   */
  delete(request, options = {}) {
    const results = this._match(request, options);
    let success = false;

    results.forEach(([req]) => {
      const s = this._items.delete(req);

      if (s) {
        success = s;
      }
    });

    return Promise.resolve(success);
  }

  /**
   * Retrieve all keys
   * @param { import('node-fetch').Request | string } [request] optionally filter based on Request
   * @param { CacheQueryOptions } [options]
   * @returns { Promise<Array<import('node-fetch').Request>> } resolves with Array of Requests
   */
  keys(request, options = {}) {
    if (!request) {
      return Promise.resolve(Array.from(this._items.keys()));
    }

    const results = this._match(request, options);

    return Promise.resolve(results.map(([req]) => req));
  }

  /**
   * @param { import('node-fetch').Request | string } request
   * @param { CacheQueryOptions } options
   * @returns { Array<[import('node-fetch').Request, import('node-fetch').Response]> }
   * @private
   */
  _match(request, { ignoreSearch = false, ignoreMethod = false }) {
    request = this._normalizeRequest(request);

    /** @type { Array<[import('node-fetch').Request, import('node-fetch').Response]> } */
    const results = [];
    const url = new URL(request.url);
    const pathname = this._normalizePathname(url.pathname);
    /** @type { string | null } */
    let method = request.method;
    /** @type { string | null } */
    let search = url.search;

    if (ignoreSearch) {
      search = null;
    }
    if (ignoreMethod) {
      method = null;
    }

    // TODO: handle VARY header

    this._items.forEach((res, req) => {
      const u = new URL(req.url);
      const s = ignoreSearch ? null : u.search;
      const m = ignoreMethod ? null : req.method;
      const p = this._normalizePathname(u.pathname);

      if (p && p === pathname && m === method && s === search) {
        results.push([req, res]);
      }
    });

    return results;
  }

  /**
   * @param { import('node-fetch').Request | string } request
   * @returns { import('node-fetch').Request }
   * @private
   */
  _normalizeRequest(request) {
    if (typeof request === 'string') {
      // @ts-ignore
      request = new Request(new URL(request, this._origin).href);
    }
    // @ts-ignore
    return request;
  }

  /**
   * @param { string } pathname
   * @returns { string }
   */
  _normalizePathname(pathname) {
    return pathname.charAt(0) !== '/' ? `/${pathname}` : pathname;
  }

  _destroy() {
    this._items.clear();
  }
}
