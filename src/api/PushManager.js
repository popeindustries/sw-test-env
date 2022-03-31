import PushSubscription from './PushSubscription.js';

/**
 * @implements MockPushManager
 */
export default class PushManager {
  constructor() {
    this.subscription = new PushSubscription({
      userVisibleOnly: true,
      applicationServerKey: 'BCnKOeg_Ly8MuvV3CIn21OahjnOOq8zeo_J0ojOPMD6RhxruIVFpLZzPi0huCn45aLq8RcHjOIMol0ytRhgAu8k',
    });
  }

  /**
   * Retrieve subscription
   * @returns { Promise<PushSubscription> }
   */
  getSubscription() {
    return Promise.resolve(this.subscription);
  }

  /**
   * Retrieve permission state
   * @param { MockPushSubscriptionOptions } [options]
   * @returns { Promise<string> }
   */
  permissionState(options) {
    return Promise.resolve('granted');
  }

  /**
   * Retrieve subscription
   * @param { MockPushSubscriptionOptions } [options]
   * @returns { Promise<PushSubscription> }
   */
  subscribe(options) {
    return Promise.resolve(this.subscription);
  }

  _destroy() {
    // @ts-ignore
    this.subscription = undefined;
  }
}
