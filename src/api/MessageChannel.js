import MessagePort from './MessagePort.js';

export default class MessageChannel {
  constructor() {
    this.port1 = new MessagePort();
    this.port2 = new MessagePort(this.port1);
  }
}
