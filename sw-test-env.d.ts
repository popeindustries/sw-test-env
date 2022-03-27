export type Headers = import('node-fetch').Headers;
export type Request = import('node-fetch').Request;
export type Response = import('node-fetch').Response;

/**
 * Create/retrieve `ServiceWorkerContainer` instance for `origin`.
 * @param origin - the origin under which to host the service worker (default is `http://localhost:3333`)
 * @param webroot - the filepath used to resolve path to service worker on disk when registering (default is `process.cwd`)
 */
export function connect(origin?: string, webroot?: string): Promise<MockServiceWorkerContainer>;

/**
 * Destroy all active `ServiceWorkerContainer` instances and their associated `ServiceWorker` contexts
 */
export function destroy(): Promise<void>;

export interface MockServiceWorkerContainer {
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
  register(scriptURL: string, options: { scope: string }): Promise<MockServiceWorkerRegistration>;
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

export interface MockServiceWorker {
  scriptURL: string;
  state: 'installing' | 'installed' | 'activating' | 'activated' | 'redundant';

  postMessage(message: unknown, transferList: Array<unknown>): void;
}

export interface MockServiceWorkerRegistration {
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

export interface MockServiceWorkerGlobalScope {
  caches: MockCacheStorage;
  clients: MockClients;
  registration: MockServiceWorkerRegistration;

  skipWaiting(): Promise<void>;
}

export interface MockContentIndex {
  add(description: ContentDescription): void;
  delete(id: string): void;
  getAll(): Promise<Array<ContentDescription>>;
}

export interface MockNavigationPreloadManager {
  enable(): Promise<void>;
  disable(): Promise<void>;
  setHeaderValue(): Promise<void>;
  getState(): Promise<{ enabled: boolean; headerValue: string }>;
}

export interface MockCacheStorage {
  has(cacheName: string): Promise<boolean>;
  open(cacheName: string): Promise<MockCache>;
  match(request: Request | string, options?: CacheQueryOptions & { cacheName?: string }): Promise<Response | undefined>;
  keys(): Promise<Array<string>>;
  delete(cacheName: string): Promise<boolean>;
}

export interface MockCache {
  match(request: Request | string, options?: CacheQueryOptions): Promise<Response | undefined>;
  matchAll(request: Request | string, options?: CacheQueryOptions): Promise<Array<Response>>;
  add(request: Request | string): Promise<void>;
  addAll(requests: Array<Request | string>): Promise<Array<void>>;
  put(request: Request | string, response: Response): Promise<void>;
  keys(request: Request | string, options?: CacheQueryOptions): Promise<Array<Request>>;
  delete(request: Request | string, options?: CacheQueryOptions): Promise<boolean>;
}

export interface MockClients {
  get(id: string): Promise<MockClient | undefined>;
  matchAll(options?: { includeUncontrolled?: boolean; type?: string }): Promise<Array<MockClient>>;
  openWindow(url: string): Promise<MockWindowClient>;
  claim(): Promise<void>;
}

export interface MockClient {
  id: string;
  type: string;
  url: string;

  postMessage(message: unknown, transferList: Array<unknown>): void;
}

export interface MockWindowClient extends MockClient {
  focused: boolean;
  visibilityState: 'hidden' | 'visible';

  focus(): Promise<MockWindowClient>;
  navigate(url: string): Promise<MockWindowClient>;
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
  fetch: Response;
  error: void;
  unhandledrejection: void;
}
