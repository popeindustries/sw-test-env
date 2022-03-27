import ExtendableEvent from './ExtendableEvent.js';

export default class MessageEvent extends ExtendableEvent {
  /**
   * Constructor
   * @param { string } type
   * @param { { data?: unknown, origin?: string, lastEventId?: string, source?: MessageEventSource, ports?: Array<MessagePort> } } [init]
   */
  constructor(type, init = {}) {
    super(type);
    this.data = init.data ?? null;
    this.origin = init.origin ?? '';
    this.source = init.source ?? null;
    this.ports = init.ports ?? [];
  }
}
