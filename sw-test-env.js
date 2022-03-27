// src/polyfills.js
import fetch2, { Headers as Headers2, Request as Request2, Response as Response2 } from 'node-fetch';
if (!global.fetch) {
  global.fetch = fetch2;
}
if (!global.Headers) {
  global.Headers = Headers2;
}
if (!global.Request) {
  global.Request = Request2;
}
if (!global.Response) {
  global.Response = Response2;
}

// src/api/Cache.js
var Cache = class {
  constructor(cacheName, origin = 'http://localhost:3333') {
    this.name = cacheName;
    this._items = /* @__PURE__ */ new Map();
    this._origin = origin;
  }
  match(request, options = {}) {
    const results = this._match(request, options);
    return Promise.resolve(results.length ? results[0][1] : void 0);
  }
  matchAll(request, options = {}) {
    const results = this._match(request, options);
    return Promise.resolve(results.map((result) => result[1]));
  }
  add(request) {
    request = this._normalizeRequest(request);
    return fetch(request.url).then((response) => {
      if (!response.ok) {
        throw new TypeError('bad response status');
      }
      return this.put(request, response);
    });
  }
  addAll(requests) {
    return Promise.all(requests.map((request) => this.add(request)));
  }
  put(request, response) {
    const existing = this._match(request, { ignoreVary: true })[0];
    if (existing) {
      request = existing[0];
    }
    request = this._normalizeRequest(request);
    this._items.set(request, response);
    return Promise.resolve();
  }
  delete(request, options = {}) {
    const results = this._match(request, options);
    let success = false;
    results.forEach(([req]) => {
      const s = this._items.delete(req);
      if (s) {
        success = s;
      }
    });
    return Promise.resolve(success);
  }
  keys(request, options = {}) {
    if (!request) {
      return Promise.resolve(Array.from(this._items.keys()));
    }
    const results = this._match(request, options);
    return Promise.resolve(results.map(([req]) => req));
  }
  _match(request, { ignoreSearch = false, ignoreMethod = false }) {
    request = this._normalizeRequest(request);
    const results = [];
    const url = new URL(request.url);
    const pathname = this._normalizePathname(url.pathname);
    let method = request.method;
    let search = url.search;
    if (ignoreSearch) {
      search = null;
    }
    if (ignoreMethod) {
      method = null;
    }
    this._items.forEach((res, req) => {
      const u = new URL(req.url);
      const s = ignoreSearch ? null : u.search;
      const m = ignoreMethod ? null : req.method;
      const p = this._normalizePathname(u.pathname);
      if (p && p === pathname && m === method && s === search) {
        results.push([req, res]);
      }
    });
    return results;
  }
  _normalizeRequest(request) {
    if (typeof request === 'string') {
      request = new Request(new URL(request, this._origin).href);
    }
    return request;
  }
  _normalizePathname(pathname) {
    return pathname.charAt(0) !== '/' ? `/${pathname}` : pathname;
  }
  _destroy() {
    this._items.clear();
  }
};

// src/api/CacheStorage.js
var CacheStorage = class {
  constructor(origin) {
    this._caches = /* @__PURE__ */ new Map();
    this._origin = origin;
  }
  has(cacheName) {
    return Promise.resolve(this._caches.has(cacheName));
  }
  open(cacheName) {
    let cache = this._caches.get(cacheName);
    if (!cache) {
      cache = new Cache(cacheName, this._origin);
      this._caches.set(cacheName, cache);
    }
    return Promise.resolve(cache);
  }
  match(request, options = {}) {
    if (options.cacheName) {
      const cache = this._caches.get(options.cacheName);
      if (!cache) {
        return Promise.reject(Error(`cache with name '${options.cacheName}' not found`));
      }
      return cache.match(request, options);
    }
    for (const cache of this._caches.values()) {
      const results = cache._match(request, options);
      if (results.length) {
        return Promise.resolve(results[0][1]);
      }
    }
    return Promise.resolve(void 0);
  }
  keys() {
    return Promise.resolve(Array.from(this._caches.keys()));
  }
  delete(cacheName) {
    return Promise.resolve(this._caches.delete(cacheName));
  }
  _destroy() {
    this._caches.clear();
  }
};

// src/api/Client.js
var uid = 0;
var Client = class {
  constructor(url, postMessage) {
    this.id = String(++uid);
    this.type = '';
    this.url = url;
    this.postMessage = postMessage || function () {};
  }
};

// src/api/WindowClient.js
var WindowClient = class extends Client {
  constructor(url, postMessage) {
    super(url, postMessage);
    this.type = 'window';
    this.focused = false;
    this.visibilityState = 'hidden';
  }
  async focus() {
    this.focused = true;
    this.visibilityState = 'visible';
    return this;
  }
  async navigate(url) {
    this.url = url;
    return this;
  }
};

// src/api/Clients.js
var Clients = class {
  constructor() {
    this._clients = [];
  }
  async get(id) {
    return this._clients.find((client) => client.id === id);
  }
  async matchAll({ type = 'any' } = {}) {
    return this._clients.filter((client) => type === 'any' || client.type === type);
  }
  async openWindow(url) {
    const client = new WindowClient(url);
    this._clients.push(client);
    return client;
  }
  claim() {
    return Promise.resolve();
  }
  _connect(url, postMessage) {
    this._clients.push(new Client(url, postMessage));
  }
  _destroy() {
    this._clients = [];
  }
};

// src/api/events/ExtendableEvent.js
var ExtendableEvent = class extends Event {
  constructor(type, init) {
    super(type);
    this.promise;
  }
  waitUntil(promise) {
    this.promise = promise;
  }
};

// src/createContext.js
import fakeIndexedDB from 'fake-indexeddb/build/fakeIndexedDB.js';
import FDBCursor from 'fake-indexeddb/build/FDBCursor.js';
import FDBCursorWithValue from 'fake-indexeddb/build/FDBCursorWithValue.js';
import FDBDatabase from 'fake-indexeddb/build/FDBDatabase.js';
import FDBFactory from 'fake-indexeddb/build/FDBFactory.js';
import FDBIndex from 'fake-indexeddb/build/FDBIndex.js';
import FDBKeyRange from 'fake-indexeddb/build/FDBKeyRange.js';
import FDBObjectStore from 'fake-indexeddb/build/FDBObjectStore.js';
import FDBOpenDBRequest from 'fake-indexeddb/build/FDBOpenDBRequest.js';
import FDBRequest from 'fake-indexeddb/build/FDBRequest.js';
import FDBTransaction from 'fake-indexeddb/build/FDBTransaction.js';
import FDBVersionChangeEvent from 'fake-indexeddb/build/FDBVersionChangeEvent.js';

// src/api/events/FetchEvent.js
import { contentType } from 'mime-types';
import path from 'path';
var FetchEvent = class extends ExtendableEvent {
  constructor(type, origin, { clientId, request, resultingClientId, replacesClientId, preloadResponse }) {
    super(type);
    this.request = request;
    this.preloadResponse = preloadResponse ?? Promise.resolve(void 0);
    this.clientId = clientId ?? '';
    this.resultingClientId = resultingClientId ?? '';
    this.replacesClientId = replacesClientId ?? '';
    let url;
    let requestInit;
    if (typeof request === 'string') {
      url = new URL(request, origin);
      const ext = path.extname(url.pathname) || '.html';
      const accept = contentType(ext) || '*/*';
      requestInit = {
        headers: {
          accept,
        },
      };
    } else {
      const { body, headers = {}, method = 'GET', redirect = 'follow' } = request;
      url = new URL(request.url, origin);
      requestInit = {
        body,
        headers,
        method,
        redirect,
      };
    }
    this.request = new Request(url.href, requestInit);
  }
  respondWith(promise) {
    this.promise = promise;
  }
};

// src/createContext.js
import FormData from 'form-data';

// src/api/events/EventTarget.js
var EventTarget = class {
  constructor() {
    this._listeners = {};
  }
  addEventListener(event, listener) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(listener);
  }
  removeEventListener(event, listener) {
    if (!this._listeners[event]) {
      return;
    }
    this._listeners[event].splice(this._listeners[event].indexOf(listener), 1);
  }
  removeAllEventListeners() {
    this._listeners = {};
  }
};

// src/api/events/ErrorEvent.js
var ErrorEvent = class extends ExtendableEvent {
  constructor(type, error) {
    super(type);
    this.message = error == null ? void 0 : error.message;
    this.promise = Promise.resolve(error);
  }
};

// src/api/events/MessageEvent.js
var MessageEvent = class extends ExtendableEvent {
  constructor(type, init = {}) {
    super(type);
    this.data = init.data ?? null;
    this.origin = init.origin ?? '';
    this.source = init.source ?? null;
    this.ports = init.ports ?? [];
  }
};

// src/events.js
function create(type, ...args) {
  switch (type) {
    case 'error':
      return new ErrorEvent('error', args[0]);
    case 'fetch':
      return new FetchEvent(type, ...args);
    case 'message':
      return new MessageEvent(type, args[0]);
    default:
      return new ExtendableEvent(type);
  }
}
function handle(target, type, ...args) {
  var _a;
  const listeners = ((_a = target._listeners[type]) == null ? void 0 : _a.slice()) || [];
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
function doHandle(listener, type, args) {
  const event = create(type, ...args);
  listener(event);
  return event.promise ?? Promise.resolve();
}

// src/api/MessagePort.js
var MessagePort = class extends EventTarget {
  constructor(otherPort) {
    super();
    this._otherPort = otherPort;
  }
  postMessage(message, transferList) {
    if (this._otherPort) {
      handle(this._otherPort, 'message', message, transferList);
    }
  }
  start() {}
  close() {}
};

// src/api/MessageChannel.js
var MessageChannel = class {
  constructor() {
    this.port1 = new MessagePort();
    this.port2 = new MessagePort(this.port1);
  }
};

// src/api/ServiceWorkerGlobalScope.js
var ServiceWorkerGlobalScope = class extends EventTarget {
  static [Symbol.hasInstance](instance) {
    return instance.registration && instance.caches && instance.clients;
  }
  constructor(registration, origin) {
    super();
    this.caches = new CacheStorage(origin);
    this.clients = new Clients();
    this.registration = registration;
  }
  async skipWaiting() {}
  _destroy() {
    this.caches._destroy();
    this.clients._destroy();
    this.removeAllEventListeners();
  }
};

// src/api/ServiceWorkerRegistration.js
var ServiceWorkerRegistration = class extends EventTarget {
  constructor(scope, unregister2) {
    super();
    this.unregister = unregister2;
    this.scope = scope;
    this.index;
    this.navigationPreload;
    this.installing = null;
    this.waiting = null;
    this.activating = null;
    this.active = null;
  }
  update() {}
  _destroy() {
    this.index = void 0;
    this.navigationPreload = void 0;
    this.installing = this.waiting = this.activating = this.active = null;
    this.removeAllEventListeners();
  }
};

// src/createContext.js
function createContext(globalScope, contextlocation, contextpath, origin) {
  const context = Object.assign(globalScope, {
    Cache,
    CacheStorage,
    Client,
    Clients,
    ExtendableEvent,
    FetchEvent,
    FormData,
    Headers,
    IDBCursor: FDBCursor,
    IDBCursorWithValue: FDBCursorWithValue,
    IDBDatabase: FDBDatabase,
    IDBFactory: FDBFactory,
    IDBIndex: FDBIndex,
    IDBKeyRange: FDBKeyRange,
    IDBObjectStore: FDBObjectStore,
    IDBOpenDBRequest: FDBOpenDBRequest,
    IDBRequest: FDBRequest,
    IDBTransaction: FDBTransaction,
    IDBVersionChangeEvent: FDBVersionChangeEvent,
    MessageChannel,
    MessageEvent,
    MessagePort,
    navigator: {
      connection: 'not implemented',
      online: true,
      permissions: 'not implemented',
      storage: 'not implemented',
      userAgent: 'sw-test-env',
    },
    Request,
    Response,
    ServiceWorkerGlobalScope,
    ServiceWorkerRegistration,
    URL,
    console,
    clearImmediate,
    clearInterval,
    clearTimeout,
    fetch,
    indexedDB: fakeIndexedDB,
    location: contextlocation,
    origin,
    process,
    setImmediate,
    setTimeout,
    setInterval,
    self: globalScope,
  });
  return context;
}

// src/index.js
import esbuild from 'esbuild';
import path2 from 'path';

// src/api/ServiceWorker.js
var ServiceWorker = class extends EventTarget {
  constructor(scriptURL, postMessage) {
    super();
    this.scriptURL = scriptURL;
    this.state = 'installing';
    this.postMessage = postMessage;
  }
  _destroy() {}
};

// src/api/ServiceWorkerContainer.js
var ServiceWorkerContainer = class extends EventTarget {
  constructor(href, webroot, register2, trigger2) {
    super();
    this.controller = null;
    this.scope;
    this._registration;
    this._sw;
    this._href = href;
    this._webroot = webroot;
    this.register = register2.bind(this, this);
    this.trigger = trigger2.bind(this, this, href);
  }
  get ready() {
    if (!this._registration) {
      throw Error('no script registered yet');
    }
    if (this.controller) {
      return Promise.resolve(this._registration);
    }
    return this.trigger('install')
      .then(() => this.trigger('activate'))
      .then(() => this._registration);
  }
  getRegistration(scope) {
    return Promise.resolve(this._registration);
  }
  getRegistrations() {
    return Promise.resolve([this._registration]);
  }
  startMessages() {}
  _destroy() {
    this.controller = void 0;
    this.scope = void 0;
    this._registration = void 0;
    this._sw = void 0;
  }
};

// src/index.js
import vm from 'vm';
import { Headers as Headers3, Request as Request3, Response as Response3 } from 'node-fetch';
var DEFAULT_ORIGIN = 'http://localhost:3333/';
var DEFAULT_SCOPE = '/';
var containers = /* @__PURE__ */ new Set();
var contexts = /* @__PURE__ */ new Map();
async function connect(origin = DEFAULT_ORIGIN, webroot = process.cwd()) {
  if (!origin.endsWith('/')) {
    origin += '/';
  }
  const container = new ServiceWorkerContainer(origin, webroot, register, trigger);
  containers.add(container);
  return container;
}
async function destroy() {
  for (const container of containers) {
    container._destroy();
  }
  for (const context of contexts.values()) {
    context.registration._destroy();
    context.sw._destroy();
    context.scope._destroy();
  }
  containers.clear();
  contexts.clear();
}
async function register(container, scriptURL, { scope = DEFAULT_SCOPE } = {}) {
  if (scriptURL.charAt(0) == '/') {
    scriptURL = scriptURL.slice(1);
  }
  const origin = getOrigin(container._href);
  const scopeHref = new URL(scope, origin).href;
  const webroot = container._webroot;
  let context = contexts.get(scopeHref);
  if (!context) {
    const contextPath = getResolvedPath(webroot, scriptURL);
    const contextLocation = new URL(scriptURL, origin);
    const registration = new ServiceWorkerRegistration(scopeHref, unregister.bind(null, scopeHref));
    const globalScope = new ServiceWorkerGlobalScope(registration, origin);
    const sw = new ServiceWorker(scriptURL, swPostMessage.bind(null, container, origin));
    const scriptPath = isRelativePath(scriptURL) ? path2.resolve(webroot, scriptURL) : scriptURL;
    try {
      const bundledSrc = esbuild.buildSync({
        bundle: true,
        entryPoints: [scriptPath],
        format: 'cjs',
        target: 'node16',
        platform: 'node',
        write: false,
      });
      const vmContext = createContext(globalScope, contextLocation, contextPath, origin);
      const sandbox = vm.createContext(vmContext);
      vm.runInContext(bundledSrc.outputFiles[0].text, sandbox);
      context = {
        registration,
        scope: sandbox,
        sw,
      };
      contexts.set(scopeHref, context);
    } catch (err) {
      throw err.message.includes('importScripts')
        ? Error('"importScripts" not supported in esm ServiceWorker. Use esm "import" statement instead')
        : err;
    }
  }
  for (const container2 of getContainersForUrlScope(scopeHref)) {
    container2._registration = context.registration;
    container2._sw = context.sw;
    container2.scope = context.scope;
    container2.scope.clients._connect(container2._href, clientPostMessage.bind(null, container2));
  }
  return container._registration;
}
function unregister(contextKey) {
  const context = contexts.get(contextKey);
  if (!context) {
    return Promise.resolve(false);
  }
  for (const container of getContainersForContext(context)) {
    container._destroy();
  }
  context.registration._destroy();
  context.sw._destroy();
  context.scope._destroy();
  contexts.delete(contextKey);
  return Promise.resolve(true);
}
function clientPostMessage(container, message, transferList) {
  handle(container, 'message', { data: message, source: container.controller });
}
function swPostMessage(container, origin, message, transferList) {
  trigger(container, origin, 'message', { data: message, origin });
}
async function trigger(container, origin, eventType, ...args) {
  const context = getContextForContainer(container);
  if (!context) {
    throw Error('no script registered yet');
  }
  const containers2 = getContainersForContext(context);
  switch (eventType) {
    case 'install':
      setState('installing', context, containers2);
      break;
    case 'activate':
      setState('activating', context, containers2);
      break;
    case 'fetch':
      args.unshift(origin);
      break;
    default:
  }
  const result = await handle(context.scope, eventType, ...args);
  switch (eventType) {
    case 'install':
      setState('installed', context, containers2);
      break;
    case 'activate':
      setState('activated', context, containers2);
      break;
    default:
  }
  return result;
}
function setState(state, context, containers2) {
  switch (state) {
    case 'installing':
      if (context.sw.state !== 'installing') {
        return;
      }
      context.registration.installing = context.sw;
      setControllerForContainers(null, containers2);
      break;
    case 'installed':
      context.sw.state = state;
      context.registration.installing = null;
      context.registration.waiting = context.sw;
      break;
    case 'activating':
      if (!context.sw.state.includes('install')) {
        throw Error('ServiceWorker not yet installed');
      }
      context.sw.state = state;
      context.registration.activating = context.sw;
      setControllerForContainers(null, containers2);
      break;
    case 'activated':
      context.sw.state = state;
      context.registration.waiting = null;
      context.registration.active = context.sw;
      setControllerForContainers(context.sw, containers2);
      break;
    default:
      if (context.sw.state !== 'activated') {
        throw Error('ServiceWorker not yet active');
      }
  }
}
function setControllerForContainers(controller, containers2) {
  for (const container of containers2) {
    container.controller = controller;
  }
}
function getContainersForContext(context) {
  const results = [];
  for (const container of containers) {
    if (container._sw === context.sw) {
      results.push(container);
    }
  }
  return results;
}
function getContainersForUrlScope(urlScope) {
  const results = [];
  for (const container of containers) {
    if (container._href.indexOf(urlScope) === 0) {
      results.push(container);
    }
  }
  return results;
}
function getContextForContainer(container) {
  for (const context of contexts.values()) {
    if (context.sw === container._sw) {
      return context;
    }
  }
}
function getOrigin(urlString) {
  const parsedUrl = new URL(urlString);
  return `${parsedUrl.protocol}//${parsedUrl.host}`;
}
function getResolvedPath(contextPath, p) {
  return isRelativePath(p) ? path2.resolve(contextPath, p) : p;
}
function isRelativePath(p) {
  return !path2.isAbsolute(p);
}
export { Headers3 as Headers, MessageChannel, Request3 as Request, Response3 as Response, connect, destroy };
