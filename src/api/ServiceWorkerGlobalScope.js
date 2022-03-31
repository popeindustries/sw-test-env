import CacheStorage from './CacheStorage.js';
import Clients from './Clients.js';
import EventTarget from './events/EventTarget.js';

/**
 * @implements MockServiceWorkerGlobalScope
 */
export default class ServiceWorkerGlobalScope extends EventTarget {
  /**
   * @param { ServiceWorkerGlobalScope } instance
   */
  static [Symbol.hasInstance](instance) {
    return instance.registration && instance.caches && instance.clients;
  }

  /**
   * Constructor
   * @param { MockServiceWorkerRegistration } registration
   * @param { string } origin
   * @param { () => Promise<void> } skipWaiting
   */
  constructor(registration, origin, skipWaiting) {
    super();
    this.caches = new CacheStorage(origin);
    this.clients = new Clients();
    this.registration = registration;
    this.skipWaiting = skipWaiting.bind(this);

    /** @type { (this: MockServiceWorkerGlobalScope, evt: MockExtendableEvent) => void } */
    this.oninstall;
    /** @type { (this: MockServiceWorkerGlobalScope, evt: MockExtendableEvent) => void } */
    this.onactivate;
    /** @type { (this: MockServiceWorkerGlobalScope, evt: MockFetchEvent) => void } */
    this.onfetch;
    /** @type { (this: MockServiceWorkerGlobalScope, evt: MockMessageEvent) => void } */
    this.onmessage;
    /** @type { (this: MockServiceWorkerGlobalScope, evt: MockErrorEvent) => void } */
    this.onerror;
  }

  _destroy() {
    this.caches._destroy();
    this.clients._destroy();
    this.removeAllEventListeners();
  }
}
