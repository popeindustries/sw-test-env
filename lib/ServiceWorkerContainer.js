'use strict';

const { handle, mixin } = require('./events');

module.exports = class ServiceWorkerContainer {
  /**
   * Constructor
   * @param {String} url
   * @param {Function} register
   */
  constructor (url, register) {
    this.controller = null;

    this.scope = null;
    this.api = null;
    this._destroyed = false;
    this._register = register;
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
   * Register ServiceWorker script at 'scriptURL'
   * @param {String} scriptURL
   * @param {Object} [options]
   *  - {String} scope
   * @returns {Promise<ServiceWorkerRegistration>}
   */
  register (scriptURL, options) {
    return this._register(this, scriptURL, options);
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

  /**
   * Trigger 'eventType' in current scope
   * @param {String} eventType
   * @returns {Promise}
   */
  trigger (eventType, ...args) {
    if (!this._registration) throw Error('no script registered yet');
    switch (eventType) {
      case 'install':
        this._setState('installing');
        break;
      case 'activate':
        this._setState('activating');
        break;
    }

    const done = () => {
      switch (eventType) {
        case 'install':
          this._setState('installed');
          break;
        case 'activate':
          this._setState('activated');
          break;
      }
    };

    // TODO: handle alternative on* methods
    if (this.scope._listeners[eventType]) {
      return handle(this.scope._listeners, eventType, ...args)
        .then((result) => {
          done();
          return result;
        });
    }

    done();

    return Promise.resolve();
  }

  /**
   * Store 'state'
   * @param {String} state
   */
  _setState (state) {
    switch (state) {
      case 'installing':
        if (this._sw.state != state) throw Error('ServiceWorker already installed');
        this._registration.installing = this._sw;
        this.controller = null;
        break;
      case 'installed':
        this._sw.state = state;
        this._registration.installing = null;
        this._registration.waiting = this._sw;
        break;
      case 'activating':
        if (this._sw.state != 'installed') throw Error('ServiceWorker not yet installed');
        this._sw.state = state;
        this._registration.activating = this._sw;
        this.controller = null;
        break;
      case 'activated':
        this._sw.state = state;
        this._registration.waiting = null;
        this._registration.active = this._sw;
        this.controller = this._sw;
        break;
      default:
        if (this._sw.state != 'activated') throw Error('ServiceWorker not yet active');
        break;
    }
  }

  _destroy () {
    if (!this._destroyed) {
      this._destroyed = true;
      this.scope._destroy();
      this.scope = null;
      this._registration.unregister();
    }
  }
};