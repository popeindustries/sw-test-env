'use strict';

const Notification = require('./Notification');
const NotificationEvent = require('./events/NotificationEvent');
const PushManager = require('./PushManager');

module.exports = class ServiceWorkerRegistration {
  /**
   * Constructor
   */
  constructor () {
    this.active = false;
    this.installing = false;
    this.pushManager = new PushManager();
    this.scope = '/';
    this.waiting = false;

    this.notifications = new Set();
  }

  /**
   * Retrieve notifications
   * @param {Object} options
   *  - {String} tag
   * @returns {Promise<Array>}
   */
  getNotifications (options) {
    // TODO: filter based on options.tag
    return Promise.resolve(Array.from(this.notifications));
  }

  /**
   * Create notification
   * @param {String} title
   * @param {Object} options
   * @returns {Promise<NotificationEvent>}
   */
  showNotification (title, options) {
    const notification = new Notification(title, options);

    this.notifications.add(notification);

    notification.close = () => {
      this.notifications.delete(notification);
    };

    return Promise.resolve(new NotificationEvent(notification));
  }

  /**
   * Update worker script
   */
  update () {
    // No-op
  }

  /**
   * Disable
   * @returns {Promise<Boolean>}
   */
  unregister () {
    // TODO: destroy?
    return Promise.resolve(true);
  }
};