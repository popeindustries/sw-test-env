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
    if (!RE_ABSOLUTE.test(urlpath)) urlpath = url.resolve(origin, urlpath);
    return nodeFetch(urlpath, options);
  };
};