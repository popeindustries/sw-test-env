'use strict';

const Notification = require('./Notification');
const NotificationEvent = require('./events/NotificationEvent');
const PushManager = require('./PushManager');

module.exports = class ServiceWorkerRegistration {
  /**
   * Constructor
   * @param {ServiceWorkerContainer} container
   * @param {String} baseURL
   * @param {String} scope
   */
  constructor (container, baseURL = 'http://127.0.0.1:4000', scope = '/') {
    this.scope = scope;
    this.pushManager = new PushManager();

    // ServiceWorker instances stored here
    this.installing = null;
    this.waiting = null;
    this.active = null;

    this._baseURL = baseURL;
    this._container = container;
    this._notifications = new Set();
  }

  /**
   * Retrieve notifications
   * @param {Object} options
   *  - {String} tag
   * @returns {Promise<Array>}
   */
  getNotifications (options) {
    // TODO: filter based on options.tag
    return Promise.resolve(Array.from(this._notifications));
  }

  /**
   * Create notification
   * @param {String} title
   * @param {Object} options
   * @returns {Promise<NotificationEvent>}
   */
  showNotification (title, options) {
    const notification = new Notification(title, options);

    this._notifications.add(notification);

    notification.close = () => {
      this._notifications.delete(notification);
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
    this._destroy();
    return Promise.resolve(true);
  }

  _destroy () {
    this.pushManager._destroy();
    this._container._destroy();
    this.pushManager = null;
    this._container = null;
    this._notifications.clear();
  }
};