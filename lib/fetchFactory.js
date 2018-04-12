'use strict';

const nodeFetch = require('node-fetch');
const urlUtil = require('url');

const RE_ABSOLUTE = /^https?/;

/**
 * Fetch function factory
 * @param {String} origin
 * @returns {Function}
 */
module.exports = function fetchFactory(origin = '') {
  return function fetch(url, options) {
    const isRequest = typeof url !== 'string';
    const request = isRequest ? url : null;

    if (request) {
      url = request.url;
    }
    if (!RE_ABSOLUTE.test(url)) {
      url = urlUtil.resolve(origin, url);
    }
    if (request) {
      const { body = {}, headers = {}, method = 'GET', redirect = 'follow' } = request;

      url = new nodeFetch.Request(url, { body, headers, method, redirect });
    }
    return nodeFetch(url, options);
  };
};
