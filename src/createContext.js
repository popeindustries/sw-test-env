/* // All ServiceWorker properties:
const swProps = 'Object,Function,Array,Number,parseFloat,parseInt,Infinity,NaN,undefined,Boolean,String,Symbol,Date,Promise,RegExp,Error,EvalError,RangeError,ReferenceError,SyntaxError,TypeError,URIError,JSON,Math,console,Intl,ArrayBuffer,Uint8Array,Int8Array,Uint16Array,Int16Array,Uint32Array,Int32Array,Float32Array,Float64Array,Uint8ClampedArray,DataView,Map,Set,WeakMap,WeakSet,Proxy,Reflect,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,escape,unescape,eval,isFinite,isNaN,ByteLengthQueuingStrategy,CountQueuingStrategy,ReadableStream,WritableStream,NavigationPreloadManager,PushSubscriptionOptions,PushSubscription,PushManager,PushEvent,PermissionStatus,Permissions,PerformanceObserverEntryList,NotificationEvent,Notification,DOMRectReadOnly,DOMRect,DOMQuad,DOMPointReadOnly,DOMPoint,DOMMatrixReadOnly,DOMMatrix,StorageManager,BudgetService,BroadcastChannel,SyncManager,SyncEvent,WindowClient,WebSocket,TextEncoder,TextDecoder,SubtleCrypto,ServiceWorkerRegistration,ServiceWorkerGlobalScope,Response,Request,PushMessageData,InstallEvent,IDBVersionChangeEvent,IDBTransaction,IDBRequest,IDBOpenDBRequest,IDBObjectStore,IDBKeyRange,IDBIndex,IDBFactory,IDBDatabase,IDBCursorWithValue,IDBCursor,Headers,FetchEvent,ExtendableMessageEvent,ExtendableEvent,EventSource,CryptoKey,Crypto,CloseEvent,Clients,Client,CacheStorage,Cache,WorkerNavigator,WorkerLocation,WorkerGlobalScope,URLSearchParams,URL,PromiseRejectionEvent,MessagePort,MessageEvent,MessageChannel,ImageData,ImageBitmap,FormData,FileReader,FileList,File,EventTarget,Event,DOMStringList,DOMException,CustomEvent,Blob,clients,registration,onactivate,onfetch,oninstall,onmessage,fetch,skipWaiting,onsync,onnotificationclick,onnotificationclose,onpush,SharedArrayBuffer,Atomics,WebAssembly,getAllPropertyNames,constructor,self,location,onerror,navigator,onrejectionhandled,onunhandledrejection,isSecureContext,origin,performance,importScripts,btoa,atob,setTimeout,clearTimeout,setInterval,clearInterval,createImageBitmap,crypto,indexedDB,fetch,caches,constructor,addEventListener,removeEventListener,dispatchEvent,constructor,constructor,__defineGetter__,__defineSetter__,hasOwnProperty,__lookupGetter__,__lookupSetter__,isPrototypeOf,propertyIsEnumerable,toString,valueOf,__proto__,toLocaleString'
*/
/* // Missing Context properties:
'Atomics,Blob,BroadcastChannel,BudgetService,ByteLengthQueuingStrategy,CloseEvent,CountQueuingStrategy,Crypto,CryptoKey,CustomEvent,DOMException,DOMMatrix,DOMMatrixReadOnly,DOMPoint,DOMPointReadOnly,DOMQuad,DOMRect,DOMRectReadOnly,DOMStringList,Event,EventSource,EventTarget,ExtendableMessageEvent,File,FileList,FileReader,ImageBitmap,ImageData,InstallEvent,NavigationPreloadManager,PerformanceObserverEntryList,PermissionStatus,Permissions,PromiseRejectionEvent,PushMessageData,PushSubscriptionOptions,ReadableStream,SharedArrayBuffer,StorageManager,SubtleCrypto,SyncEvent,SyncManager,TextDecoder,TextEncoder,URLSearchParams,WebSocket,WindowClient,WorkerGlobalScope,WorkerLocation,WorkerNavigator,WritableStream,atob,btoa,createImageBitmap,crypto,dispatchEvent,isSecureContext,onactivate,onerror,onfetch,oninstall,onmessage,onnotificationclick,onnotificationclose,onpush,onrejectionhandled,onsync,onunhandledrejection,performance,removeEventListener'
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

import Cache from './api/Cache.js';
import CacheStorage from './api/CacheStorage.js';
import Client from './api/Client.js';
import Clients from './api/Clients.js';
import ExtendableEvent from './api/events/ExtendableEvent.js';
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
import FetchEvent from './api/events/FetchEvent.js';
import FormData from 'form-data';
import ServiceWorkerGlobalScope from './api/ServiceWorkerGlobalScope.js';
import ServiceWorkerRegistration from './api/ServiceWorkerRegistration.js';

/**
 * Create context object for 'globalScope'
 * @param { Object } globalScope
 * @param { Object } contextlocation
 * @param { string } contextpath
 * @param { string } origin
 * @returns { ServiceWorkerGlobalScope }
 */
export default function createContext(globalScope, contextlocation, contextpath, origin) {
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

  // @ts-ignore
  return context;
}
