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
    /** @type { MockServiceWorkerGlobalScope & Record<string, unknown> } */
    this.self;
    /** @type { 'installing' | 'installed' | 'activating' | 'activated' | 'redundant' } */
    this.state = 'installing';
    this.postMessage = postMessage;

    /** @type { ((this: MockServiceWorker, evt: Event) => void) | undefined } */
    this.onstatechange;
  }

  _destroy() {
    // @ts-ignore
    this.self._destroy();
    // @ts-ignore
    this.self = undefined;
  }
}
