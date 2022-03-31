/**
 * @implements MockExtendableEvent
 */
export default class ExtendableEvent extends Event {
  /**
   *
   * @param { string } type
   * @param { Object } [init]
   */
  constructor(type, init) {
    super(type);
    /** @type { Promise<unknown> | undefined } */
    this.promise;
  }

  /**
   * Wait until 'promise' resolves
   * @param { Promise<unknown> } promise
   * @returns { void }
   */
  waitUntil(promise) {
    this.promise = promise;
  }
}
