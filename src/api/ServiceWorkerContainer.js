/**
 * @typedef { import('./ServiceWorker').default } ServiceWorker
 * @typedef { import('./ServiceWorkerGlobalScope').default } ServiceWorkerGlobalScope
 * @typedef { import('./ServiceWorkerRegistration').default } ServiceWorkerRegistration
 */
import EventTarget from './events/EventTarget.js';

export default class ServiceWorkerContainer extends EventTarget {
  /**
   * Constructor
   * @param { string } href
   * @param { string } webroot
   * @param { (container: ServiceWorkerContainer, scriptURL: string, options?: { scope: string }) => Promise<ServiceWorkerRegistration> } register
   * @param { (container: ServiceWorkerContainer, eventType: string) => Promise<unknown> } trigger
   */
  constructor(href, webroot, register, trigger) {
    super();
    /** @type { ServiceWorker | null } */
    this.controller = null;
    this.register = register.bind(this, this);
    this.trigger = trigger.bind(this, this);
    /** @type { ServiceWorkerGlobalScope & Record<string, unknown> } */
    this.scope;
    /** @type { ServiceWorkerRegistration } */
    this._registration;
    /** @type { ServiceWorker } */
    this._sw;
    this._href = href;
    this._webroot = webroot;
    // this.api = undefined;
  }

  /**
   * Retrieve ServiceWorkerRegistration when active
   * Will trigger install/activate lifecycle
   * @returns { Promise<ServiceWorkerRegistration> }
   */
  get ready() {
    if (!this._registration) {
      throw Error('no script registered yet');
    }
    if (this.controller) {
      return Promise.resolve(this._registration);
    }

    return this.trigger('install')
      .then(() => this.trigger('activate'))
      .then(() => this._registration);
  }

  /**
   * Retrieve current ServiceWorker registration
   * @param { string } [scope]
   * @returns { Promise<ServiceWorkerRegistration> }
   */
  getRegistration(scope) {
    return Promise.resolve(this._registration);
  }

  /**
   * Retrieve all current ServiceWorker registrations
   * @param { string } [scope]
   * @returns { Promise<Array<ServiceWorkerRegistration>> }
   */
  getRegistrations(scope) {
    return Promise.resolve([this._registration]);
  }

  _destroy() {
    // @ts-ignore
    this.controller = undefined;
    // @ts-ignore
    this.scope = undefined;
    // @ts-ignore
    this._registration = undefined;
    // @ts-ignore
    this._sw = undefined;
  }
}
