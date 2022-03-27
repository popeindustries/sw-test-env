declare type Header = import('node-fetch').Header;
declare type Request = import('node-fetch').Request;
declare type Response = import('node-fetch').Response;

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

declare interface MockServiceWorkerContainer {
  /** The current `ServiceWorker`, if active */
  controller: MockServiceWorker | null;
  /** Resolves with `ServiceWorkerRegistration` when `ServiceWorker` becomes active */
  ready: Promise<MockServiceWorkerRegistration>;
  /** The global execution context of your service worker (`self` inside the worker script) */
  scope: MockServiceWorkerGlobalScope & Record<string, unknown>;

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

declare interface MockServiceWorker {
  scriptURL: string;
  state: 'installing' | 'installed' | 'activating' | 'activated' | 'redundant';

  postMessage(message: unknown, transferList?: Array<unknown>): void;
}

declare interface MockServiceWorkerRegistration {
  scope: string;
  index?: ContentIndex;
  navigationPreload?: MockNavigationPreloadManager;
  installing: MockServiceWorker | null;
  waiting: MockServiceWorker | null;
  activating: MockServiceWorker | null;
  active: MockServiceWorker | null;

  update(): void;
  unregister(): Promise<boolean>;
}

declare interface MockServiceWorkerGlobalScope {
  caches: MockCacheStorage;
  clients: MockClients;
  registration: MockServiceWorkerRegistration;

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
  match(request: Req | string, options?: CacheQueryOptions & { cacheName?: string }): Promise<Res | undefined>;
  keys(): Promise<Array<string>>;
  delete(cacheName: string): Promise<boolean>;
}

declare interface MockCache {
  match(request: Req | string, options?: CacheQueryOptions): Promise<Res | undefined>;
  matchAll(request: Req | string, options?: CacheQueryOptions): Promise<Array<Res>>;
  add(request: Req | string): Promise<void>;
  addAll(requests: Array<Req | string>): Promise<Array<void>>;
  put(request: Req | string, response: Res): Promise<void>;
  keys(request?: Req | string, options?: CacheQueryOptions): Promise<Array<Req>>;
  delete(request: Req | string, options?: CacheQueryOptions): Promise<boolean>;
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

declare class MessageChannel {
  port1: MessagePort;
  port2: MessagePort;
}

declare class MessagePort extends EventTarget {
  postMessage(messsage: unknown, transferList?: Array<unknown>);
  start(): void;
  close(): void;
}

type CacheQueryOptions = {
  ignoreSearch?: boolean;
  ignoreMethod?: boolean;
  ignoreVary?: boolean;
};

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
  fetch: Res;
  error: void;
  unhandledrejection: void;
}

type Req = import('node-fetch').Request;

type Res = import('node-fetch').Response;
