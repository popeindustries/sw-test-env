/**
 * @typedef { import('./ContentIndex').default } ContentIndex
 * @typedef { import('./NavigationPreloadManager').default } NavigationPreloadManager
 * @typedef { import('./ServiceWorker').default } ServiceWorker
 */
import EventTarget from './events/EventTarget.js';

export default class ServiceWorkerRegistration extends EventTarget {
  /**
   * Constructor
   * @param { string } scope
   * @param { () => void } unregister
   */
  constructor(scope, unregister) {
    super();
    this.unregister = unregister;
    this.scope = scope;
    /** @type { ContentIndex | undefined } */
    this.index;
    /** @type { NavigationPreloadManager | undefined } */
    this.navigationPreload;

    /** @type { ServiceWorker | null } */
    this.installing = null;
    /** @type { ServiceWorker | null } */
    this.waiting = null;
    /** @type { ServiceWorker | null } */
    this.activating = null;
    /** @type { ServiceWorker | null } */
    this.active = null;
  }

  /**
   * Update worker script
   * @returns {void}
   */
  update() {
    // No-op
  }

  _destroy() {
    this.index = undefined;
    this.navigationPreload = undefined;
    this.removeAllEventListeners();
  }
}
