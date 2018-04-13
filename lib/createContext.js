'use strict';

/* // All ServiceWorker properties:
const swProps = 'Object,Function,Array,Number,parseFloat,parseInt,Infinity,NaN,undefined,Boolean,String,Symbol,Date,Promise,RegExp,Error,EvalError,RangeError,ReferenceError,SyntaxError,TypeError,URIError,JSON,Math,console,Intl,ArrayBuffer,Uint8Array,Int8Array,Uint16Array,Int16Array,Uint32Array,Int32Array,Float32Array,Float64Array,Uint8ClampedArray,DataView,Map,Set,WeakMap,WeakSet,Proxy,Reflect,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,escape,unescape,eval,isFinite,isNaN,ByteLengthQueuingStrategy,CountQueuingStrategy,ReadableStream,WritableStream,NavigationPreloadManager,PushSubscriptionOptions,PushSubscription,PushManager,PushEvent,PermissionStatus,Permissions,PerformanceObserverEntryList,NotificationEvent,Notification,DOMRectReadOnly,DOMRect,DOMQuad,DOMPointReadOnly,DOMPoint,DOMMatrixReadOnly,DOMMatrix,StorageManager,BudgetService,BroadcastChannel,SyncManager,SyncEvent,WindowClient,WebSocket,TextEncoder,TextDecoder,SubtleCrypto,ServiceWorkerRegistration,ServiceWorkerGlobalScope,Response,Request,PushMessageData,InstallEvent,IDBVersionChangeEvent,IDBTransaction,IDBRequest,IDBOpenDBRequest,IDBObjectStore,IDBKeyRange,IDBIndex,IDBFactory,IDBDatabase,IDBCursorWithValue,IDBCursor,Headers,FetchEvent,ExtendableMessageEvent,ExtendableEvent,EventSource,CryptoKey,Crypto,CloseEvent,Clients,Client,CacheStorage,Cache,WorkerNavigator,WorkerLocation,WorkerGlobalScope,URLSearchParams,URL,PromiseRejectionEvent,MessagePort,MessageEvent,MessageChannel,ImageData,ImageBitmap,FormData,FileReader,FileList,File,EventTarget,Event,DOMStringList,DOMException,CustomEvent,Blob,clients,registration,onactivate,onfetch,oninstall,onmessage,fetch,skipWaiting,onsync,onnotificationclick,onnotificationclose,onpush,SharedArrayBuffer,Atomics,WebAssembly,getAllPropertyNames,constructor,self,location,onerror,navigator,onrejectionhandled,onunhandledrejection,isSecureContext,origin,performance,importScripts,btoa,atob,setTimeout,clearTimeout,setInterval,clearInterval,createImageBitmap,crypto,indexedDB,fetch,caches,constructor,addEventListener,removeEventListener,dispatchEvent,constructor,constructor,__defineGetter__,__defineSetter__,hasOwnProperty,__lookupGetter__,__lookupSetter__,isPrototypeOf,propertyIsEnumerable,toString,valueOf,__proto__,toLocaleString'
*/
/* // Missing Context properties:
'Atomics,Blob,BroadcastChannel,BudgetService,ByteLengthQueuingStrategy,CloseEvent,CountQueuingStrategy,Crypto,CryptoKey,CustomEvent,DOMException,DOMMatrix,DOMMatrixReadOnly,DOMPoint,DOMPointReadOnly,DOMQuad,DOMRect,DOMRectReadOnly,DOMStringList,Event,EventSource,EventTarget,ExtendableMessageEvent,File,FileList,FileReader,FormData,ImageBitmap,ImageData,InstallEvent,NavigationPreloadManager,PerformanceObserverEntryList,PermissionStatus,Permissions,PromiseRejectionEvent,PushMessageData,PushSubscriptionOptions,ReadableStream,SharedArrayBuffer,StorageManager,SubtleCrypto,SyncEvent,SyncManager,TextDecoder,TextEncoder,URLSearchParams,WebSocket,WindowClient,WorkerGlobalScope,WorkerLocation,WorkerNavigator,WritableStream,atob,btoa,createImageBitmap,crypto,dispatchEvent,isSecureContext,onactivate,onerror,onfetch,oninstall,onmessage,onnotificationclick,onnotificationclose,onpush,onrejectionhandled,onsync,onunhandledrejection,performance,removeEventListener'
*/
/*
function getAllPropertyNames(obj) {
  let props = [];
  do {
    props = props.concat(Object.getOwnPropertyNames(obj));
  } while ((obj = Object.getPrototypeOf(obj)));
  return props;
}
*/

const { URL } = require('url');
const Cache = require('./Cache');
const CacheStorage = require('./CacheStorage');
const Client = require('./Client');
const Clients = require('./Clients');
const ExtendableEvent = require('./events/ExtendableEvent');
const FetchEvent = require('./events/FetchEvent');
const fakeIndexedDB = require('fake-indexeddb/build/fakeIndexedDB');
const fs = require('fs');
const FDBCursor = require('fake-indexeddb/build/FDBCursor');
const FDBCursorWithValue = require('fake-indexeddb/build/FDBCursorWithValue');
const FDBDatabase = require('fake-indexeddb/build/FDBDatabase');
const FDBFactory = require('fake-indexeddb/build/FDBFactory');
const FDBIndex = require('fake-indexeddb/build/FDBIndex');
const FDBKeyRange = require('fake-indexeddb/build/FDBKeyRange');
const FDBObjectStore = require('fake-indexeddb/build/FDBObjectStore');
const FDBOpenDBRequest = require('fake-indexeddb/build/FDBOpenDBRequest');
const FDBRequest = require('fake-indexeddb/build/FDBRequest');
const FDBTransaction = require('fake-indexeddb/build/FDBTransaction');
const FDBVersionChangeEvent = require('fake-indexeddb/build/FDBVersionChangeEvent');
const Headers = require('./Headers');
const MessageChannel = require('./MessageChannel');
const MessageEvent = require('./events/MessageEvent');
const MessagePort = require('./MessagePort');
const Notification = require('./Notification');
const NotificationEvent = require('./events/NotificationEvent');
const path = require('path');
const PushEvent = require('./events/PushEvent');
const PushManager = require('./PushManager');
const PushSubscription = require('./PushSubscription');
const Request = require('./Request');
const Response = require('./Response');
const ServiceWorkerGlobalScope = require('./ServiceWorkerGlobalScope');
const ServiceWorkerRegistration = require('./ServiceWorkerRegistration');

const nativeRequire = require;

/**
 * Create context object for 'globalScope'
 * @param {Object} globalScope
 * @param {Object} contextlocation
 * @param {String} contextpath
 * @param {String} origin
 * @param {Function} fetch
 * @returns {Object}
 */
module.exports = function createContext(globalScope, contextlocation, contextpath, origin, fetch) {
  const scriptModule = { exports: {} };
  const context = Object.assign(globalScope, {
    Cache,
    CacheStorage,
    Client,
    Clients,
    ExtendableEvent,
    FetchEvent,
    Headers,
    IDBCursor: FDBCursor.default,
    IDBCursorWithValue: FDBCursorWithValue.default,
    IDBDatabase: FDBDatabase.default,
    IDBFactory: FDBFactory.default,
    IDBIndex: FDBIndex.default,
    IDBKeyRange: FDBKeyRange.default,
    IDBObjectStore: FDBObjectStore.default,
    IDBOpenDBRequest: FDBOpenDBRequest.default,
    IDBRequest: FDBRequest.default,
    IDBTransaction: FDBTransaction.default,
    IDBVersionChangeEvent: FDBVersionChangeEvent.default,
    MessageChannel,
    MessageEvent,
    MessagePort,
    navigator: {
      connection: 'not implemented',
      online: true,
      permissions: 'not implemented',
      storage: 'not implemented',
      userAgent: 'sw-test-env'
    },
    Notification,
    NotificationEvent,
    PushEvent,
    PushManager,
    PushSubscription,
    Request,
    Response,
    ServiceWorkerGlobalScope,
    ServiceWorkerRegistration,
    URL,
    console,
    clearImmediate,
    clearInterval,
    clearTimeout,
    exports: scriptModule.exports,
    fetch,
    indexedDB: fakeIndexedDB.default,
    location: contextlocation,
    module: scriptModule,
    origin,
    process,
    setImmediate,
    setTimeout,
    setInterval,
    self: globalScope,
    require: getRequire(contextpath)
  });

  return context;
};

/**
 * Retrieve 'require' function for 'contextpath'
 * @param {String} contextpath
 * @returns {Function}
 */
function getRequire(contextpath) {
  const r = function require(requiredpath) {
    return nativeRequire(getResolvedPath(contextpath, requiredpath));
  };

  r.resolve = function resolve(requiredpath) {
    return nativeRequire.resolve(getResolvedPath(contextpath, requiredpath));
  };

  return r;
}

/**
 * Retrieve the fully resolved path
 * @param {String} contextpath
 * @param {String} p
 * @returns {String}
 */
function getResolvedPath(contextpath, p) {
  try {
    if (fs.statSync(contextpath).isFile()) {
      contextpath = path.dirname(contextpath);
    }
  } catch (err) {
    /* swallow */
  }

  return isRelativePath(p) ? path.resolve(contextpath, p) : p;
}

/**
 * Determine if 'p' is relative path
 * @param {String} p
 * @returns {Boolean}
 */
function isRelativePath(p) {
  return p.indexOf('.') === 0;
}
