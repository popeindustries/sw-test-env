'use strict';

const nodeFetch = require('node-fetch');
const url = require('url');

const RE_ABSOLUTE = /^https?/;

/**
 * Fetch function factory
 * @param {String} origin
 * @returns {Function}
 */
module.exports = function fetchFactory (origin = '') {
  return function fetch (urlpath, options) {
    const isRequest = 'string' != typeof urlpath;
    const request = isRequest ? urlpath : null;

    if (request) urlpath = request.url;
    if (!RE_ABSOLUTE.test(urlpath)) urlpath = url.resolve(origin, urlpath);
    if (request) {
      request.url = urlpath;
      urlpath = request;
    }
    return nodeFetch(urlpath, options);
  };
};