import EventTarget from './events/EventTarget.js';

/**
 * @implements MockServiceWorkerContainer
 */
export default class ServiceWorkerContainer extends EventTarget {
  /**
   * Constructor
   * @param { string } href
   * @param { string } webroot
   * @param { (container: ServiceWorkerContainer, scriptURL: string, options?: { scope: string }) => Promise<MockServiceWorkerRegistration> } register
   * @param { (container: ServiceWorkerContainer, origin: string, eventType: string, ...args: Array<unknown>) => Promise<any> } trigger
   */
  constructor(href, webroot, register, trigger) {
    super();
    /** @type { MockServiceWorker | null } */
    this.controller = null;
    /** @type { MockServiceWorker } */
    this.__serviceWorker__;

    /** @type { MockServiceWorkerRegistration } */
    this._registration;
    this._href = href;
    this._webroot = webroot;

    this.register = register.bind(this, this);
    this.trigger = trigger.bind(this, this, href);

    /** @type { ((this: MockServiceWorkerContainer, evt: MockMessageEvent) => void) | undefined } */
    this.onmessage;
  }

  /**
   * Retrieve ServiceWorkerRegistration when active
   * Will trigger install/activate lifecycle
   * @returns { Promise<MockServiceWorkerRegistration> }
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
   * @returns { Promise<MockServiceWorkerRegistration> }
   */
  getRegistration(scope) {
    return Promise.resolve(this._registration);
  }

  /**
   * Retrieve all current ServiceWorker registrations
   * @returns { Promise<Array<MockServiceWorkerRegistration>> }
   */
  getRegistrations() {
    return Promise.resolve([this._registration]);
  }

  startMessages() {
    // TODO
  }

  _destroy() {
    // @ts-ignore
    this.controller = this._registration = this.__serviceWorker__ = undefined;
  }
}
