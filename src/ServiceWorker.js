'use strict';

const { mixin } = require('./events');

module.exports = class ServiceWorker {
  /**
   * Constructor
   * @param {String} scriptURL
   * @param {Function} postMessage
   */
  constructor(scriptURL, postMessage) {
    this.scriptURL = scriptURL;
    // installing => installed => activating => activated => redundant
    this.state = 'installing';
    this.postMessage = postMessage;

    mixin(this);
  }

  _destroy() {
    // no-op
  }
};
