'use strict';

const nodeFetch = require('node-fetch');
const Request = require('./Request');
const urlUtil = require('url');

module.exports = class Cache {
  /**
   * Constructor
   * @param {String} cacheName
   * @param {Function} fetch
   * @param {String} origin
   */
  constructor(cacheName, fetch = nodeFetch, origin = 'http://localhost:3333') {
    this.name = cacheName;

    this._items = new Map();
    this._fetch = fetch;
    this._origin = origin;
  }

  /**
   * Retrieve 'response' for matching 'request'
   * @param {Request|String} request
   * @param {Object} [options]
   *  - {Boolean} ignoreSearch
   *  - {Boolean} ignoreMethod
   *  - {Boolean} ignoreVary
   * @returns {Promise<Response>}
   */
  match(request, options = {}) {
    const results = this._match(request, options);

    return Promise.resolve(results.length ? results[0][1] : undefined);
  }

  /**
   * Retrieve one or more 'response's for matching 'request'
   * @param {Request} request
   * @param {Object} [options]
   *  - {Boolean} ignoreSearch
   *  - {Boolean} ignoreMethod
   *  - {Boolean} ignoreVary
   * @returns {Promise<Array>} resolves with Array of Responses
   */
  matchAll(request, options = {}) {
    const results = this._match(request, options);

    return Promise.resolve(results.map(result => result[1]));
  }

  /**
   * Fetch and store a 'request'
   * @param {Request|String} request
   * @returns {Promise<void>}
   */
  add(request) {
    request = this._normalizeRequest(request);

    return this._fetch(request.url).then(response => {
      if (!response.ok) {
        throw new TypeError('bad response status');
      }
      return this.put(request, response);
    });
  }

  /**
   * Fetch and store one or more 'request's
   * @param {Array} requests Array of Requests
   * @returns {Promise<Array>} resolves with Array of void
   */
  addAll(requests) {
    return Promise.all(requests.map(request => this.add(request)));
  }

  /**
   * Store 'response' keyed by 'request'
   * @param {Request|String} request
   * @param {Response} response
   * @returns {Promise<void>}
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
   * @param {Request|String} request
   * @param {Object} [options]
   *  - {Boolean} ignoreSearch
   *  - {Boolean} ignoreMethod
   *  - {Boolean} ignoreVary
   * @returns {Promise<Boolean>} resolves with 'true' if deleted
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
   * @param {Request|String} [request] optionally filter based on Request
   * @param {Object} [options]
   *  - {Boolean} ignoreSearch
   *  - {Boolean} ignoreMethod
   *  - {Boolean} ignoreVary
   * @returns {Promise<Array>} resolves with Array of Requests
   */
  keys(request, options = {}) {
    if (!request) {
      return Promise.resolve(Array.from(this._items.keys()));
    }

    const results = this._match(request, options);

    return Promise.resolve(results.map(([req]) => req));
  }

  _match(request, { ignoreSearch = false, ignoreMethod = false }) {
    request = this._normalizeRequest(request);

    const results = [];
    const url = urlUtil.parse(request.url);
    const pathname = this._normalizePathname(url.pathname);
    let method = request.method;
    let search = url.search;

    if (ignoreSearch) {
      search = null;
    }
    if (ignoreMethod) {
      method = null;
    }

    // TODO: handle VARY header

    this._items.forEach((res, req) => {
      const u = urlUtil.parse(req.url);
      const s = ignoreSearch ? null : u.search;
      const m = ignoreMethod ? null : req.method;
      const p = this._normalizePathname(u.pathname);

      if (p && p === pathname && m === method && s === search) {
        results.push([req, res]);
      }
    });

    return results;
  }

  _normalizeRequest(request) {
    if (typeof request == 'string') {
      request = new Request(urlUtil.resolve(this._origin, request));
    }
    return request;
  }

  _normalizePathname(pathname) {
    return pathname.charAt(0) !== '/' ? `/${pathname}` : pathname;
  }

  _destroy() {
    this._items.clear();
  }
};
