'use strict';

const MessageEvent = require('./events/MessageEvent');

module.exports = class MessagePort {
  /**
   * Constructor
   * @param {MessagePort} otherPort
   */
  constructor (otherPort) {
    this._listeners = {};
    this._otherPort = otherPort;
  }

  /**
   * Register listener 'fn' for 'event'
   * @param {String} event
   * @param {Function} fn
   */
  addEventListener (event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  }

  /**
   * Send 'message'
   * @param {*} message
   * @param {Array} [transferList]
   */
  postMessage (message, transferList) {
    // TODO: handle onmessage format
    if (this._otherPort && this._otherPort._listeners.message) {
      this._otherPort._listeners.message.forEach((fn) => fn(new MessageEvent(message, transferList)));
    }
  }

  /**
   * Send queued messages
   */
  start () {

  }

  /**
   * Stop sending messages
   */
  close () {

  }
};