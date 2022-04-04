import ContentIndex from './ContentIndex.js';
import EventTarget from './events/EventTarget.js';
import NavigationPreloadManager from './NavigationPreloadManager.js';
import PushManager from './PushManager.js';

/**
 * @implements MockServiceWorkerRegistration
 */
export default class ServiceWorkerRegistration extends EventTarget {
  /**
   * Constructor
   * @param { string } scope
   * @param { () => Promise<boolean> } unregister
   */
  constructor(scope, unregister) {
    super();
    this.unregister = unregister;
    this.scope = scope;
    this.index = new ContentIndex();
    this.pushManager = new PushManager();
    this.navigationPreload = new NavigationPreloadManager();

    /** @type { ((this: MockServiceWorkerRegistration, evt: Event) => void) | undefined } */
    this.onupdatefound;

    /** @type { MockServiceWorker | null } */
    this.installing = null;
    /** @type { MockServiceWorker | null } */
    this.waiting = null;
    /** @type { MockServiceWorker | null } */
    this.activating = null;
    /** @type { MockServiceWorker | null } */
    this.active = null;

    /** @type { Set<MockNotification> } */
    this._notifications = new Set();
  }

  /**
   * Retrieve notifications
   * @param { { tag?: string }} [options]
   * @returns { Promise<Array<MockNotification>> }
   */
  async getNotifications(options) {
    const notifications = Array.from(this._notifications);

    if (options?.tag && options.tag.length > 0) {
      return notifications.filter((notification) => (notification.tag ? notification.tag === options.tag : false));
    }

    return notifications;
  }

  /**
   * Create notification
   * @param { string } title
   * @param { NotificationOptions } [options]
   * @returns { Promise<void> }
   */
  async showNotification(title, options) {
    const notification = new Notification(title, options);

    this._notifications.add(notification);

    notification.close = () => {
      this._notifications.delete(notification);
    };
  }

  /**
   * Update worker script
   */
  update() {
    // No-op
  }

  _destroy() {
    // @ts-ignore
    this.index = undefined;
    this.pushManager._destroy();
    // @ts-ignore
    this.pushManager = undefined;
    // @ts-ignore
    this.navigationPreload = undefined;
    this.installing = this.waiting = this.activating = this.active = null;
    this.removeAllEventListeners();
  }
}
