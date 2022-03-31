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

declare interface MockPushEvent extends MockExtendableEvent {
  data: MockPushMessageData;
}

declare interface MockNotificationEvent extends MockExtendableEvent {
  notification: MockNotification;
}

type FetchEventInit = {
  request: import('node-fetch').Request;
  preloadResponse?: Promise<import('node-fetch').Response>;
  clientId?: string;
  resultingClientId?: string;
  replacesClientId?: string;
  isReload?: boolean;
};
