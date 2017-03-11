'use strict';

let uid = 0;

module.exports = class Client {
  /**
   * Constructor
   * @param {String} url
   */
  constructor (url) {
    this.url = url;
    this.id = ++uid;

    this.sw = null;
  }

  /**
   * Send message to active ServiceWorker
   * @param {String} message
   * @param {Array} transfer
   */
  postMessage (message, transfer) {
    throw new Error('Not implemented yet');
  }
};