// @ts-ignore
declare type Headers = import('node-fetch').Headers;
// @ts-ignore
declare type Request = import('node-fetch').Request;
// @ts-ignore
declare type Response = import('node-fetch').Response;

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
  pushManager?: MockPushManager;
  installing: MockServiceWorker | null;
  waiting: MockServiceWorker | null;
  activating: MockServiceWorker | null;
  active: MockServiceWorker | null;

  getNotifications(options?: { tag?: string }): Promise<Array<MockNotification>>;
  showNotification(title: string, options?: NotificationOptions): Promise<void>;
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
  setHeaderValue(headerValue: string): Promise<void>;
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

declare type PostMessage = (message: unknown, transferList: Array<unknown>) => void;

declare interface MockMessageChannel {
  port1: MockMessagePort;
  port2: MockMessagePort;
}

// @ts-ignore
declare class MessageChannel {
  port1: MockMessagePort;
  port2: MockMessagePort;
}

declare interface MockMessagePort extends MockEventTarget {
  onmessage: ((this: MockMessagePort, evt: MockMessageEvent) => void) | undefined;

  postMessage: PostMessage;
  start(): void;
  close(): void;
}

declare interface MockPushManager {
  subscription: MockPushSubscription;

  getSubscription(): Promise<MockPushSubscription>;
  permissionState(): Promise<string>;
  subscribe(): Promise<MockPushSubscription>;
}

declare interface MockNotification {
  body: string;
  data: any;
  dir: 'auto' | 'ltr' | 'rtl';
  icon: string;
  lang: string;
  tag: string;
  title: string;

  close(): void;
}

declare interface MockPushMessageData {
  arrayBuffer(): ArrayBuffer;
  blob(): import('buffer').Blob;
  json(): Object;
  text(): string;
}

declare interface MockPushSubscription {
  endpoint: string;
  expirationTime: number | null;
  options?: { userVisibleOnly: boolean; applicationServerKey: string };

  getKey(name: 'p256dh' | 'auth'): ArrayBuffer;
  toJSON(): Object;
  unsubscribe(): Promise<boolean>;
}

type MockPushSubscriptionOptions = {
  userVisibleOnly: boolean;
  applicationServerKey: string;
};

type ContentDescription = {
  id: string;
  title: string;
  description: string;
  category: '' | 'homepage' | 'article' | 'video' | 'audio';
  icons: Array<{ src: string; sizes: string; type: string }>;
  url: string;
};

interface TriggerEvents {
  install: void;
  activate: void;
  fetch: import('node-fetch').Response;
  error: void;
  unhandledrejection: void;
}
