'use strict';

const { mixin } = require('./events');

module.exports = class ServiceWorkerContainer {
  /**
   * Constructor
   * @param {String} url
   * @param {Function} register
   * @param {Function} trigger
   */
  constructor (url, register, trigger) {
    this.controller = null;
    this.register = register.bind(this, this);
    this.trigger = trigger.bind(this, this);

    this.scope = null;
    this.api = null;
    this._registration = null;
    this._sw = null;
    this._url = url;

    mixin(this);
  }

  /**
   * Retrieve ServiceWorkerRegistration when active
   * Will trigger install/activate lifecycle
   * @returns {Promise<ServiceWorkerRegistration>}
   */
  get ready () {
    if (!this._registration) throw Error('no script registered yet');
    if (this.controller) return Promise.resolve(this._registration);
    return this.trigger('install')
      .then(() => this.trigger('activate'))
      .then(() => this._registration);
  }

  /**
   * Retrieve current ServiceWorker registration
   * @param {String} [scope]
   * @returns {Promise<ServiceWorkerRegistration>}
   */
  getRegistration (scope) {
    return Promise.resolve(this._registration);
  }

  /**
   * Retrieve all current ServiceWorker registrations
   * @param {String} [scope]
   * @returns {Promise<Array>}
   */
  getRegistrations () {
    return Promise.resolve([this._registration]);
  }

  _destroy () {
    this.controller = null;
    this.scope = null;
    this._registration = null;
    this._sw = null;
  }
};