import ExtendableEvent from './ExtendableEvent.js';
import PushMessageData from '../PushMessageData.js';

/**
 * @implements MockPushEvent
 */
export default class PushEvent extends ExtendableEvent {
  /**
   *
   * @param { string } type
   * @param { { data?: Object } } [init]
   */
  constructor(type, init = {}) {
    super(type);
    this.data = new PushMessageData(init.data);
  }
}
