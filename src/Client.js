'use strict';

let uid = 0;

module.exports = class Client {
  /**
   * Constructor
   * @param {String} url
   * @param {Function} postMessage
   */
  constructor(url, postMessage) {
    this.url = url;
    this.id = ++uid;

    this.postMessage = postMessage || function () {};
  }
};
