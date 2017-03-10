'use strict';

const nodeFetch = require('node-fetch');
const url = require('url');

const RE_ABSOLUTE = /^https?/;

/**
 * Fetch function factory
 * @param {String} baseURL
 * @returns {Function}
 */
module.exports = function fetchFactory (baseURL = '') {
  return function fetch (urlpath, options) {
    if (!RE_ABSOLUTE.test(urlpath)) urlpath = url.resolve(baseURL, urlpath);
    return nodeFetch(urlpath, options);
  };
};