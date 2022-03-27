let uid = 0;

/**
 * @implements MockClient
 */
export default class Client {
  /**
   * Constructor
   * @param { string } url
   * @param { (message: unknown, transferList: Array<unknown>) => void } [postMessage]
   */
  constructor(url, postMessage) {
    this.id = String(++uid);
    this.type = '';
    this.url = url;
    this.postMessage = postMessage || function () {};
  }
}
