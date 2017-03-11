'use strict';

module.exports = class ServiceWorker {
  /**
   * Constructor
   * @param {String} scriptURL
   * @param {Function} postMessage
   */
  constructor (scriptURL, postMessage) {
    this.scriptURL = scriptURL;
    // installing => installed => activating => activated => redundant
    this.state = 'installing';

    this.postMessage = postMessage;
  }
};