import ExtendableEvent from './ExtendableEvent.js';

/**
 * @implements MockNotificationEvent
 */
export default class NotificationEvent extends ExtendableEvent {
  /**
   *
   * @param { string } type
   * @param { MockNotification } notification
   */
  constructor(type, notification) {
    super(type);
    this.notification = notification;
  }
}
