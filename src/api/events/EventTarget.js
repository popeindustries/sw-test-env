/**
 * Simple EventTarget base class to enable `removeAllEventListeners()`
 */
export default class EventTarget {
  constructor() {
    /** @type { Record<string, Array<(event: Event) => void >> } */
    this._listeners = {};
  }

  /**
   * @param { string } eventType
   * @param { (event: Event) => void } listener
   */
  addEventListener(eventType, listener) {
    if (!this._listeners[eventType]) {
      this._listeners[eventType] = [];
    }
    this._listeners[eventType].push(listener);
  }

  /**
   * @param { string } eventType
   * @param { (event: Event) => void } listener
   */
  removeEventListener(eventType, listener) {
    if (!this._listeners[eventType]) {
      return;
    }
    this._listeners[eventType].splice(this._listeners[eventType].indexOf(listener), 1);
  }

  removeAllEventListeners() {
    this._listeners = {};
  }

  /**
   * @param { Event } event
   * @returns { boolean }
   */
  dispatchEvent(event) {
    return false;
  }
}
