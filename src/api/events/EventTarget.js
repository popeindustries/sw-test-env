/**
 * Simple EventTarget base class to enable `removeAllEventListeners()`
 * @implements MockEventTarget
 */
export default class EventTarget {
  constructor() {
    /** @type { Record<string, Array<(event: Event) => void >> } */
    this.listeners = {};
  }

  /**
   * @param { string } eventType
   * @param { (event: Event) => void } listener
   */
  addEventListener(eventType, listener) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(listener);
  }

  /**
   * @param { string } eventType
   * @param { (event: Event) => void } listener
   */
  removeEventListener(eventType, listener) {
    if (!this.listeners[eventType]) {
      return;
    }
    this.listeners[eventType].splice(this.listeners[eventType].indexOf(listener), 1);
  }

  removeAllEventListeners() {
    this.listeners = {};
  }

  /**
   * @param { Event } event
   * @returns { boolean }
   */
  dispatchEvent(event) {
    return false;
  }
}
