'use strict';

module.exports = class PushSubscription {
  /**
   * Constructor
   * @param {Object} options
   */
  constructor(options) {
    this.endpoint = 'test';
    this.options = options;
  }

  /**
   * Retrieve public key
   * @returns {ArrayBuffer}
   */
  getKey() {
    return new ArrayBuffer(20);
  }

  /**
   * Serialize
   * @returns {Object}
   */
  toJSON() {
    return {
      endpoint: this.endpoint,
      options: this.options,
    };
  }

  /**
   * Unregister subscription
   * @returns {Promise<Boolean>}
   */
  unsubscribe() {
    // TODO: remove from PushManager
    return Promise.resolve(true);
  }
};
