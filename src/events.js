import ErrorEvent from './api/events/ErrorEvent.js';
import ExtendableEvent from './api/events/ExtendableEvent.js';
import FetchEvent from './api/events/FetchEvent.js';
import MessageEvent from './api/events/MessageEvent.js';
import NotificationEvent from './api/events/NotificationEvent.js';

/**
 * Create 'event' instance
 * @param { EventTarget } target
 * @param { string } type
 * @param { Array<unknown> } args
 */
export function create(target, type, ...args) {
  let event;

  switch (type) {
    case 'error':
      // @ts-ignore
      event = new ErrorEvent('error', args[0]);
      break;
    case 'fetch':
      // @ts-ignore
      event = new FetchEvent(type, ...args);
      break;
    case 'message':
      // @ts-ignore
      event = new MessageEvent(type, args[0]);
      break;
    case 'notificationclick':
      // @ts-ignore
      return new NotificationEvent(type, args[0]);
    default:
      event = new ExtendableEvent(type);
  }

  Object.defineProperty(event, 'target', {
    value: target,
    writable: false,
  });

  return event;
}

/**
 * Handle event 'type' from 'target'
 * @param { MockEventTarget } target
 * @param { string } type
 * @param { Array<unknown> } args
 * @returns { Promise<unknown> }
 */
export function handle(target, type, ...args) {
  const listeners = target.listeners[type]?.slice() || [];
  // @ts-ignore
  const onevent = target[`on${type}`];

  if (onevent) {
    listeners.push(onevent);
  }

  if ((type === 'error' || type === 'unhandledrejection') && !listeners.length) {
    throw args[0] || Error(`unhandled error of type ${type}`);
  }

  if (listeners.length === 1) {
    return doHandle(target, listeners[0], type, args);
  }

  return Promise.all(listeners.map((listener) => doHandle(target, listener, type, args)));
}

/**
 * Execute handle of 'listener'
 * @param { EventTarget } target
 * @param { (event: Event) => void } listener
 * @param { string } type
 * @param { Array<unknown> } args
 * @returns { Promise<unknown> }
 */
function doHandle(target, listener, type, args) {
  const event = create(target, type, ...args);

  listener(event);
  return event.promise ?? Promise.resolve();
}
