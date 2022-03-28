import EventTarget from './events/EventTarget.js';
import { handle } from '../events.js';

/**
 * @implements MockMessagePort
 */
export default class MessagePort extends EventTarget {
  /**
   * Constructor
   * @param { MessagePort } [otherPort]
   */
  constructor(otherPort) {
    super();
    this._otherPort = otherPort;

    /** @type { ((this: MockMessagePort, evt: MockMessageEvent) => void) | undefined } */
    this.onmessage;
  }

  /**
   * Send 'message'
   * @param { unknown } message
   * @param { Array<unknown> } [transferList]
   * @returns { void }
   */
  postMessage(message, transferList = []) {
    const ports = transferList.filter((item) => item instanceof MessagePort);

    if (this._otherPort) {
      handle(this._otherPort, 'message', { data: message, ports });
    }
  }

  /**
   * Send queued messages
   * @returns { void }
   */
  start() {
    // no-op
  }

  /**
   * Stop sending messages
   * @returns { void }
   */
  close() {
    // no-op
  }
}
