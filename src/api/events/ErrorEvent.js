import ExtendableEvent from './ExtendableEvent.js';

export default class ErrorEvent extends ExtendableEvent {
  /**
   *
   * @param { string } type
   * @param { Error } error
   */
  constructor(type, error) {
    super(type);
    this.message = error?.message ?? 'Error';
    this.error = error;
    this.promise = Promise.resolve(error);
  }
}
