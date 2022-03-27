import EventTarget from './events/EventTarget.js';
import { handle } from '../events.js';

export default class MessagePort extends EventTarget {
  /**
   * Constructor
   * @param { MessagePort } [otherPort]
   */
  constructor(otherPort) {
    super();
    this._otherPort = otherPort;
  }

  /**
   * Send 'message'
   * @param { unknown } message
   * @param { Array<unknown> } [transferList]
   * @returns { void }
   */
  postMessage(message, transferList) {
    if (this._otherPort) {
      handle(this._otherPort, 'message', message, transferList);
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
