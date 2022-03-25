import ExtendableEvent from './api/events/ExtendableEvent.js';
import FetchEvent from './api/events/FetchEvent.js';

/**
 * Create 'event' instance
 * @param { string } type
 * @param { Object } init
 * @returns { ExtendableEvent }
 */
export function create(type, init) {
  switch (type) {
    case 'fetch':
      return new FetchEvent(type, /** @type { import('./api/events/FetchEvent').FetchEventInit } */ (init));
    default:
      return new ExtendableEvent(type, init);
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

  return Promise.all(
    listeners.map(
      /**
       * @param { (event: Event) => void } listener
       * @returns { Promise<unknown> }
       */
      (listener) => doHandle(listener, type, args),
    ),
  );
}

/**
 * Execute handle of 'listener'
 * @param { (event: Event) => void } listener
 * @param { string } type
 * @param { Object } init
 * @returns { Promise<unknown> }
 */
function doHandle(listener, type, init) {
  const event = create(type, init);

  listener(event);
  return event.promise || Promise.resolve();
}
