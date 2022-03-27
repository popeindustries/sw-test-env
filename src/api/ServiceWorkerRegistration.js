import EventTarget from './events/EventTarget.js';

/**
 * @implements MockServiceWorkerRegistration
 */
export default class ServiceWorkerRegistration extends EventTarget {
  /**
   * Constructor
   * @param { string } scope
   * @param { () => Promise<boolean> } unregister
   */
  constructor(scope, unregister) {
    super();
    this.unregister = unregister;
    this.scope = scope;
    /** @type { MockContentIndex | undefined } */
    this.index;
    /** @type { MockNavigationPreloadManager | undefined } */
    this.navigationPreload;

    /** @type { MockServiceWorker | null } */
    this.installing = null;
    /** @type { MockServiceWorker | null } */
    this.waiting = null;
    /** @type { MockServiceWorker | null } */
    this.activating = null;
    /** @type { MockServiceWorker | null } */
    this.active = null;
  }

  /**
   * Update worker script
   */
  update() {
    // No-op
  }

  _destroy() {
    this.index = undefined;
    this.navigationPreload = undefined;
    this.installing = this.waiting = this.activating = this.active = null;
    this.removeAllEventListeners();
  }
}
