'use strict';

const ExtendableEvent = require('./ExtendableEvent');
const Request = require('../Request');

module.exports = class FetchEvent extends ExtendableEvent {
  /**
   * Constructor
   * @param {Request|String} request
   */
  constructor(request) {
    super();

    // TODO: clientId/isReload
    if (typeof request === 'string') {
      request = new Request(request);
    }
    this.request = request;
  }

  /**
   * Store response
   * @param {Promise} promise
   * @returns {void}
   */
  respondWith(promise) {
    this.promise = promise;
  }
};
