'use strict';

class Notification {
  /**
   * Constructor
   * @param {Sttring} title
   * @param {Object} options
   */
  constructor(title, options) {
    this.title = title;
    Object.assign(this, options);
  }

  /**
   * Retrieve permission state
   * @returns {Promise<String>}
   */
  requestPermission() {
    return Promise.resolve(Notification.permission);
  }
}

Notification.permission = 'granted';

module.exports = Notification;
