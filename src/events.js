import ErrorEvent from './api/events/ErrorEvent.js';
import ExtendableEvent from './api/events/ExtendableEvent.js';
import FetchEvent from './api/events/FetchEvent.js';
import MessageEvent from './api/events/MessageEvent.js';

/**
 * Create 'event' instance
 * @param { string } type
 * @param { Array<unknown> } args
 */
export function create(type, ...args) {
  switch (type) {
    case 'error':
      // @ts-ignore
      return new ErrorEvent('error', args[0]);
    case 'fetch':
      // @ts-ignore
      return new FetchEvent(type, ...args);
    case 'message':
      // @ts-ignore
      return new MessageEvent(type, args[0]);
    default:
      return new ExtendableEvent(type);
  }
}

/**
 * Handle event 'type' from 'target'
 * @param { { _listeners: Record<string, Array<(event: Event) => void >> } } target
 * @param { string } type
 * @param { Array<unknown> } args
 * @returns { Promise<unknown> }
 */
export function handle(target, type, ...args) {
  const listeners = target._listeners[type]?.slice() || [];
  // @ts-ignore
  const onevent = target[`on${type}`];

  if (onevent) {
    listeners.push(onevent);
  }

  if ((type === 'error' || type === 'unhandledrejection') && !listeners.length) {
    throw args[0] || Error(`unhandled error of type ${type}`);
  }

  if (listeners.length === 1) {
    return doHandle(listeners[0], type, args);
  }

  return Promise.all(listeners.map((listener) => doHandle(listener, type, args)));
}

/**
 * Execute handle of 'listener'
 * @param { (event: Event) => void } listener
 * @param { string } type
 * @param { Array<unknown> } args
 * @returns { Promise<unknown> }
 */
function doHandle(listener, type, args) {
  const event = create(type, ...args);

  listener(event);
  return event.promise ?? Promise.resolve();
}
