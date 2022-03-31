import EventTarget from './events/EventTarget.js';

export default class Notification extends EventTarget {
  /**
   * @param { string } title
   * @param { NotificationOptions } [options]
   */
  constructor(title, options) {
    super();
    this.title = title;
    Object.assign(this, options);
  }

  onclick() {
    //
  }

  close() {
    // Implemented at creation
  }
}

Notification.maxActions = 16;
Notification.permission = 'default';
Notification.requestPermission = async () => {
  Notification.permission = 'granted';
  return Notification.permission;
};
