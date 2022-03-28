/// <reference types="node" />

/**
 * Create/retrieve `ServiceWorkerContainer` instance for `origin`.
 * @param origin - the origin under which to host the service worker (default is `http://localhost:3333`)
 * @param webroot - the filepath used to resolve path to service worker on disk when registering (default is `process.cwd`)
 */
declare function connect(origin?: string, webroot?: string): Promise<MockServiceWorkerContainer>;

/**
 * Destroy all active `ServiceWorkerContainer` instances and their associated `ServiceWorker` contexts
 */
declare function destroy(): Promise<void>;

declare interface MockServiceWorkerContainer extends MockEventTarget {
  /** The current `ServiceWorker`, if active */
  controller: MockServiceWorker | null;
  /** Resolves with `ServiceWorkerRegistration` when `ServiceWorker` becomes active */
  ready: Promise<MockServiceWorkerRegistration>;
  /** The global execution context of your service worker (`self` inside the worker script) */
  scope: MockServiceWorkerGlobalScope & Record<string, unknown>;

  onmessage: ((this: MockServiceWorkerContainer, evt: MockMessageEvent) => void) | undefined;

  /**
   * Install or update a service worker
   * @param scriptURL - the path to your service worker file (resolved based on optional `webroot` passed to `connect()`)
   * @param options - optional directory `scope` under which your service worker should be registered
   */
  register(scriptURL: string, options?: { scope: string }): Promise<MockServiceWorkerRegistration>;
  /**
   * Trigger event in active service worker context
   */
  trigger<EventType extends keyof TriggerEvents>(
    eventType: EventType,
    ...args: Array<unknown>
  ): Promise<TriggerEvents[EventType]>;
  /**
   * Retrieve the current registration for `scope`
   * @param scope
   */
  getRegistration(scope: string): Promise<MockServiceWorkerRegistration>;
  /**
   * Retrieve all current registrations for this container
   * @param scope
   */
  getRegistrations(scope: string): Promise<Array<MockServiceWorkerRegistration>>;
}

declare interface MockServiceWorker extends MockEventTarget {
  scriptURL: string;
  state: 'installing' | 'installed' | 'activating' | 'activated' | 'redundant';

  postMessage(message: unknown, transferList?: Array<unknown>): void;
}

declare interface MockServiceWorkerRegistration extends MockEventTarget {
  scope: string;
  index?: MockContentIndex;
  navigationPreload?: MockNavigationPreloadManager;
  installing: MockServiceWorker | null;
  waiting: MockServiceWorker | null;
  activating: MockServiceWorker | null;
  active: MockServiceWorker | null;

  update(): void;
  unregister(): Promise<boolean>;
}

declare interface MockServiceWorkerGlobalScope extends MockEventTarget {
  caches: MockCacheStorage;
  clients: MockClients;
  registration: MockServiceWorkerRegistration;

  oninstall: ((this: MockServiceWorkerGlobalScope, evt: MockExtendableEvent) => void) | undefined;
  onactivate: ((this: MockServiceWorkerGlobalScope, evt: MockExtendableEvent) => void) | undefined;
  onfetch: ((this: MockServiceWorkerGlobalScope, evt: MockFetchEvent) => void) | undefined;
  onmessage: ((this: MockServiceWorkerGlobalScope, evt: MockMessageEvent) => void) | undefined;
  onerror: ((this: MockServiceWorkerGlobalScope, evt: MockErrorEvent) => void) | undefined;

  skipWaiting(): Promise<void>;
}

declare interface MockContentIndex {
  add(description: ContentDescription): void;
  delete(id: string): void;
  getAll(): Promise<Array<ContentDescription>>;
}

declare interface MockNavigationPreloadManager {
  enable(): Promise<void>;
  disable(): Promise<void>;
  setHeaderValue(): Promise<void>;
  getState(): Promise<{ enabled: boolean; headerValue: string }>;
}

declare interface MockCacheStorage {
  has(cacheName: string): Promise<boolean>;
  open(cacheName: string): Promise<MockCache>;
  match(
    request: import('node-fetch').Request | string,
    options?: CacheQueryOptions & { cacheName?: string },
  ): Promise<import('node-fetch').Response | undefined>;
  keys(): Promise<Array<string>>;
  delete(cacheName: string): Promise<boolean>;
}

declare interface MockCache {
  match(
    request: import('node-fetch').Request | string,
    options?: CacheQueryOptions,
  ): Promise<import('node-fetch').Response | undefined>;
  matchAll(
    request: import('node-fetch').Request | string,
    options?: CacheQueryOptions,
  ): Promise<Array<import('node-fetch').Response>>;
  add(request: import('node-fetch').Request | string): Promise<void>;
  addAll(requests: Array<import('node-fetch').Request | string>): Promise<Array<void>>;
  put(request: import('node-fetch').Request | string, response: import('node-fetch').Response): Promise<void>;
  keys(
    request?: import('node-fetch').Request | string,
    options?: CacheQueryOptions,
  ): Promise<Array<import('node-fetch').Request>>;
  delete(request: import('node-fetch').Request | string, options?: CacheQueryOptions): Promise<boolean>;
}

declare interface MockClients {
  get(id: string): Promise<MockClient | undefined>;
  matchAll(options?: { includeUncontrolled?: boolean; type?: string }): Promise<Array<MockClient>>;
  openWindow(url: string): Promise<MockWindowClient>;
  claim(): Promise<void>;
}

declare interface MockClient {
  id: string;
  type: string;
  url: string;

  postMessage(message: unknown, transferList?: Array<unknown>): void;
}

declare interface MockWindowClient extends MockClient {
  focused: boolean;
  visibilityState: 'hidden' | 'visible';

  focus(): Promise<MockWindowClient>;
  navigate(url: string): Promise<MockWindowClient>;
}

declare interface MockEventTarget {
  listeners: Record<string, Array<(event: Event) => void>>;

  addEventListener(eventType: string, listener: (event: Event) => void): void;
  removeEventListener(eventType: string, listener: (event: Event) => void): void;
  removeAllEventListeners(): void;
  dispatchEvent(event: Event): boolean;
}

declare interface MockExtendableEvent extends Event {
  waitUntil(promise: Promise<unknown>): void;
}

declare interface MockFetchEvent extends MockExtendableEvent {
  request: import('node-fetch').Request;
  preloadResponse: Promise<import('node-fetch').Response | undefined>;
  clientId: string;
  resultingClientId: string;
  replacesClientId: string;

  respondWith(promise: Promise<unknown>): void;
}

declare interface MockMessageEvent extends MockExtendableEvent {
  data: unknown | null;
  origin: string;
  source: MessageEventSource | null;
  ports: Array<MockMessagePort>;
}

declare interface MockErrorEvent extends MockExtendableEvent {
  message: string | null;
  error: Error;
}

declare type PostMessage = (message: unknown, transferList: Array<unknown>) => void;

declare interface MockMessageChannel {
  port1: MockMessagePort;
  port2: MockMessagePort;
}
// @ts-ignore
declare type MessageChannel = MockMessageChannel;

declare interface MockMessagePort extends MockEventTarget {
  onmessage: ((this: MockMessagePort, evt: MockMessageEvent) => void) | undefined;

  postMessage: PostMessage;
  start(): void;
  close(): void;
}

type ContentDescription = {
  id: string;
  title: string;
  description: string;
  category: '' | 'homepage' | 'article' | 'video' | 'audio';
  icons: Array<{ src: string; sizes: string; type: string }>;
  url: string;
};

type FetchEventInit = {
  request: Request;
  preloadResponse?: Promise<Response>;
  clientId?: string;
  resultingClientId?: string;
  replacesClientId?: string;
  isReload?: boolean;
};

interface TriggerEvents {
  install: void;
  activate: void;
  fetch: import('node-fetch').Response;
  error: void;
  unhandledrejection: void;
}

declare module 'fake-indexeddb/build/fakeIndexedDB.js' {}
declare module 'fake-indexeddb/build/FDBCursor.js' {}
declare module 'fake-indexeddb/build/FDBCursorWithValue.js' {}
declare module 'fake-indexeddb/build/FDBDatabase.js' {}
declare module 'fake-indexeddb/build/FDBFactory.js' {}
declare module 'fake-indexeddb/build/FDBIndex.js' {}
declare module 'fake-indexeddb/build/FDBKeyRange.js' {}
declare module 'fake-indexeddb/build/FDBObjectStore.js' {}
declare module 'fake-indexeddb/build/FDBOpenDBRequest.js' {}
declare module 'fake-indexeddb/build/FDBRequest.js' {}
declare module 'fake-indexeddb/build/FDBTransaction.js' {}
declare module 'fake-indexeddb/build/FDBVersionChangeEvent.js' {}
