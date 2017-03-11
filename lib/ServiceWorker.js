'use strict';

module.exports = class ServiceWorker {
  /**
   * Constructor
   * @param {String} scriptURL
   */
  constructor (scriptURL) {
    this.scriptURL = scriptURL;
    // installing => installed => activating => activated => redundant
    this.state = 'installing';
  }

  /**
   * Send message to active Client
   * @param {String} message
   * @param {Array} transfer
   */
  postMessage (message, transfer) {
    throw new Error('Not implemented yet');
  }
};