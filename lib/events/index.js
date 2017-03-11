'use strict';

const ExtendableEvent = require('./ExtendableEvent');
const FetchEvent = require('./FetchEvent');
const MessageEvent = require('./MessageEvent');
const NotificationEvent = require('./NotificationEvent');
const PushEvent = require('./PushEvent');

module.exports = {
  create,
  handle
};

/**
 * Create 'event' instance
 * @param {String} type
 * @returns {ExtendableEvent}
 */
function create (type, ...args) {
  switch (type) {
    case 'fetch':
      return new FetchEvent(...args);
    case 'notificationclick':
      return new NotificationEvent(...args);
    case 'push':
      return new PushEvent(...args);
    case 'message':
      return new MessageEvent(...args);
    default:
      return new ExtendableEvent();
  }
}

/**
 * Handle event 'type' for 'listeners'
 * @param {Array} listeners
 * @param {String} type
 * @returns {Promise}
 */
function handle (listeners, type, ...args) {
  if (listeners[type].length == 1) {
    return doHandle(listeners[type][0], type, args);
  }
  return Promise.all(listeners[type].map((fn) => doHandle(fn, type, args)));
}

/**
 * Execute handle of 'listener'
 * @param {Function} listener
 * @param {String} type
 * @param {Array} args
 * @returns {Promise}
 */
function doHandle (listener, type, args) {
  const event = create(type, ...args);

  listener(event);
  return event.promise || Promise.resolve();
}