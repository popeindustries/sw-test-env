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
};