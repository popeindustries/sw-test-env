'use strict';

const PushSubscription = require('./PushSubscription');

module.exports = class PushManager {
  /**
   * Constructor
   */
  constructor () {
    this.subscription = new PushSubscription();
  }

  /**
   * Retrieve subscription
   * @returns {Promise<PushSubscription>}
   */
  getSubscription () {
    return Promise.resolve(this.subscription);
  }

  /**
   * Retrieve permission state
   * @returns {Promise<String>}
   */
  permissionState () {
    return Promise.resolve('granted');
  }

  /**
   * Retrieve subscription
   * @returns {Promise<PushSubscription>}
   */
  subscribe () {
    return Promise.resolve(this.subscription);
  }

  _destroy () {
    this.subscription = null;
  }
};