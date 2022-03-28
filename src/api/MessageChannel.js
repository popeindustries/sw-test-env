import MessagePort from './MessagePort.js';

/**
 * @implements MockMessageChannel
 */
export default class MessageChannel {
  constructor() {
    this.port1 = new MessagePort();
    this.port2 = new MessagePort(this.port1);
  }
}
