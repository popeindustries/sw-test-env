'use strict';

const nodeFetch = require('node-fetch');
const Request = require('./Request');

module.exports = class Cache {
  /**
   * Constructor
   * @param {String} cacheName
   * @param {Function} fetch
   */
  constructor(cacheName, fetch) {
    this.name = cacheName;

    this._items = new Map();
    this._fetch = fetch || nodeFetch;
  }

  /**
   * Retrieve 'response' for matching 'request'
   * @param {Request} request
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
    if (typeof request === 'string') {
      request = new Request(request);
    }

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
   * @param {Request} request
   * @param {Response} response
   * @returns {Promise<void>}
   */
  put(request, response) {
    // Allow duplicates if different VARY headers
    const existing = this._match(request, { ignoreVary: true })[0];

    if (existing) {
      request = existing[0];
    }
    this._items.set(request, response);
    return Promise.resolve();
  }

  /**
   * Remove 'response' matching 'request'
   * @param {Request} request
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
   * @param {Request} [request] optionally filter based on Request
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
    let { method, url } = request;
    const results = [];

    if (ignoreSearch) {
      url = url.split('?')[0];
    }
    if (ignoreMethod) {
      method = '';
    }

    // TODO: handle VARY header

    this._items.forEach((res, req) => {
      const u = ignoreSearch ? req.url.split('?')[0] : req.url;
      const m = ignoreMethod ? '' : req.method;

      if (u && u === url && m === method) {
        results.push([req, res]);
      }
    });

    return results;
  }

  _destroy() {
    this._items.clear();
  }
};
