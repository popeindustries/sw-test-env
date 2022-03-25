import ExtendableEvent from './ExtendableEvent.js';

export default class ContentIndexEvent extends ExtendableEvent {
  /**
   * Constructor
   * @param { string } type
   * @param { { id?: number }} data
   */
  constructor(type, data = {}) {
    super(type);
    this.id = data.id;
  }
}
