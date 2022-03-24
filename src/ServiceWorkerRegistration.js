'use strict';

const Notification = require('./Notification');
const NotificationEvent = require('./events/NotificationEvent');
const PushManager = require('./PushManager');

module.exports = class ServiceWorkerRegistration {
  /**
   * Constructor
   * @param {String} scope
   * @param {Function} unregister
   */
  constructor(scope, unregister) {
    this.pushManager = new PushManager();
    this.unregister = unregister;
    this.scope = scope;

    // ServiceWorker instances stored here
    this.installing = null;
    this.waiting = null;
    this.active = null;

    this._notifications = new Set();
  }

  /**
   * Retrieve notifications
   * @param {Object} options
   *  - {String} tag
   * @returns {Promise<Array>}
   */
  getNotifications(options) {
    // TODO: filter based on options.tag
    return Promise.resolve(Array.from(this._notifications));
  }

  /**
   * Create notification
   * @param {String} title
   * @param {Object} options
   * @returns {Promise<NotificationEvent>}
   */
  showNotification(title, options) {
    const notification = new Notification(title, options);

    this._notifications.add(notification);

    notification.close = () => {
      this._notifications.delete(notification);
    };

    return Promise.resolve(new NotificationEvent(notification));
  }

  /**
   * Update worker script
   * @returns {void}
   */
  update() {
    // No-op
  }

  _destroy() {
    this.pushManager._destroy();
    this.pushManager = null;
    this._notifications.clear();
  }
};
