/**
 * @implements MockPushSubscription
 */
export default class PushSubscription {
  /**
   * Constructor
   * @param { MockPushSubscriptionOptions } [options]
   */
  constructor(options) {
    this.endpoint = 'test';
    /** @type { number | null } */
    this.expirationTime = null;
    this.options = options;
    this._keys = {
      p256dh: new ArrayBuffer(65),
      auth: new ArrayBuffer(16),
      applicationServerKey: new ArrayBuffer(87),
    };
  }

  /**
   * Retrieve public key
   * @param { 'p256dh' | 'auth' } name
   */
  getKey(name) {
    return this._keys[name];
  }

  /**
   * Serialize
   */
  toJSON() {
    return {
      endpoint: this.endpoint,
      expirationTime: this.expirationTime,
      options: this.options,
    };
  }

  /**
   * Unregister subscription
   */
  unsubscribe() {
    // TODO: remove from PushManager
    return Promise.resolve(true);
  }
}
