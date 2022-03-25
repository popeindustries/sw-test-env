import Client from './Client.js';

export default class WindowClient extends Client {
  /**
   * Constructor
   * @param { string } url
   * @param { (message: unknown, transferList: Array<unknown>) => void } [postMessage]
   */
  constructor(url, postMessage) {
    super(url, postMessage);
    this.type = 'window';
    this.focused = false;
    this.visibilityState = 'hidden';
  }

  /**
   * Focus window
   */
  async focus() {
    this.focused = true;
    this.visibilityState = 'visible';
    return this;
  }

  /**
   * Navigate to new `url`
   * @param { string } url
   */
  async navigate(url) {
    this.url = url;
    return this;
  }
}
