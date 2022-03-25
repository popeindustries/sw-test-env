/**
 * @typedef { import('./ServiceWorkerRegistration').default } ServiceWorkerRegistration
 */
import CacheStorage from './CacheStorage.js';
import Clients from './Clients.js';
import EventTarget from './events/EventTarget.js';

export default class ServiceWorkerGlobalScope extends EventTarget {
  /**
   * @param { ServiceWorkerGlobalScope } instance
   */
  static [Symbol.hasInstance](instance) {
    return instance.registration && instance.caches && instance.clients;
  }

  /**
   * Constructor
   * @param { ServiceWorkerRegistration } registration
   * @param { string } origin
   */
  constructor(registration, origin) {
    super();
    this.registration = registration;
    this.caches = new CacheStorage(origin);
    this.clients = new Clients();
  }

  /**
   * Force active
   */
  async skipWaiting() {
    //
  }

  _destroy() {
    this.caches._destroy();
    this.clients._destroy();
    this.removeAllEventListeners();
  }
}
