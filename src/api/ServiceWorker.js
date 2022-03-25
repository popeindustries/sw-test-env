import EventTarget from './events/EventTarget.js';

export default class ServiceWorker extends EventTarget {
  /**
   * Constructor
   * @param { string } scriptURL
   * @param { (message: unknown, transferList: Array<unknown>) => void } postMessage
   */
  constructor(scriptURL, postMessage) {
    super();
    this.scriptURL = scriptURL;
    /** @type { 'installing' | 'installed' | 'activating' | 'activated' | 'redundant' } */
    this.state = 'installing';
    this.postMessage = postMessage;
  }

  _destroy() {
    // no-op
  }
}
