import EventTarget from './events/EventTarget.js';

/**
 * @implements MockServiceWorker
 */
export default class ServiceWorker extends EventTarget {
  /**
   * Constructor
   * @param { string } scriptURL
   * @param { PostMessage } postMessage
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
