'use strict';

module.exports = class ExtendableEvent {
  /**
   * Wait until finished
   * @returns {Promise}
   */
  waitUntil () {
    return Promise.resolve();
  }
};