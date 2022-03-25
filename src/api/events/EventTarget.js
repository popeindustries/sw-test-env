/**
 * Simple EventTarget base class to enable `removeAllEventListeners()`
 */
export default class EventTarget {
  constructor() {
    /** @type { Record<string, Array<(event: Event) => void >> } */
    this._listeners = {};
  }

  /**
   * @param { string } event
   * @param { (event: Event) => void } listener
   */
  addEventListener(event, listener) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(listener);
  }

  /**
   * @param { string } event
   * @param { (event: Event) => void } listener
   */
  removeEventListener(event, listener) {
    if (!this._listeners[event]) {
      return;
    }
    this._listeners[event].splice(this._listeners[event].indexOf(listener), 1);
  }

  removeAllEventListeners() {
    this._listeners = {};
  }
}
