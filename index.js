'use strict';

const { handle } = require('./lib/events');
const fetchFactory = require('./lib/fetchFactory');
const fs = require('fs');
const Headers = require('./lib/Headers');
const indexedDB = require('./lib/indexedDB');
const MessageChannel = require('./lib/MessageChannel');
const path = require('path');
const Request = require('./lib/Request');
const Response = require('./lib/Response');
const ServiceWorker = require('./lib/ServiceWorker');
const ServiceWorkerContainer = require('./lib/ServiceWorkerContainer');
const ServiceWorkerGlobalScope = require('./lib/ServiceWorkerGlobalScope');
const ServiceWorkerRegistration = require('./lib/ServiceWorkerRegistration');
const url = require('url');
const vm = require('vm');

const DEFAULT_ORIGIN = 'http://localhost:3333/';
const DEFAULT_SCOPE = './';

const containers = new Set();
const contexts = new Map();
const nativeRequire = require;
const parentPath = path.dirname(module.parent.filename);

module.exports = {
  Headers,
  MessageChannel,
  Request,
  Response,

  /**
   * Create/retrieve ServiceWorkerContainer instance for 'domain'
   * @param {String} [url]
   * @param {String} [webroot]
   * @returns {ServiceWorkerContainer}
   */
  connect(url = DEFAULT_ORIGIN, webroot = parentPath) {
    if (url.slice(-1) !== '/') {
      url += '/';
    }

    const container = new ServiceWorkerContainer(url, webroot, register, trigger);

    containers.add(container);

    // TODO: check if active context and apply state

    return container;
  },

  /**
   * Destroy all active containers/contexts
   * @returns {void}
   */
  destroy() {
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
};

/**
 * Register ServiceWorker script at 'scriptURL'
 * @param {ServiceWorkerContainer} container
 * @param {String} scriptURL
 * @param {Object} [options]
 *  - {String} scope
 * @returns {Promise<ServiceWorkerRegistration>}
 */
function register(container, scriptURL, { scope = DEFAULT_SCOPE } = {}) {
  const origin = getOrigin(container._url);
  const urlScope = url.resolve(origin, scope);
  let context;

  if (contexts.has(urlScope)) {
    context = contexts.get(urlScope);
  } else {
    const isPath = !~scriptURL.indexOf('\n');
    const contextpath = isPath ? getResolvedPath(parentPath, scriptURL) : parentPath;
    const location = url.parse(path.join(origin, isPath ? scriptURL : 'sw.js').replace(/:\//, '://'));
    const fetch = fetchFactory(origin);
    const registration = new ServiceWorkerRegistration(unregister.bind(null, urlScope));
    const globalScope = new ServiceWorkerGlobalScope(registration, fetch);
    const sw = new ServiceWorker(isPath ? scriptURL : '', swPostMessage.bind(null, container));
    const script = isPath
      ? fs.readFileSync(isRelativePath(scriptURL) ? path.resolve(parentPath, scriptURL) : scriptURL, 'utf8')
      : scriptURL;
    const scriptModule = { exports: {} };

    location.origin = origin;
    location._webroot = container._webroot;
    context = Object.assign(globalScope, indexedDB, {
      clearImmediate,
      clearInterval,
      clearTimeout,
      console,
      fetch,
      Request,
      Response,
      Headers,
      location,
      module: scriptModule,
      exports: scriptModule.exports,
      process,
      setImmediate,
      setTimeout,
      setInterval,
      self: globalScope,
      require: getRequire(contextpath)
    });
    context.importScripts = getImportScripts(context);

    const sandbox = vm.createContext(context);

    vm.runInContext(script, sandbox);

    context = {
      api: scriptModule.exports,
      registration,
      scope: sandbox,
      sw
    };
    contexts.set(urlScope, context);
  }

  getContainersForUrlScope(urlScope).forEach(container => {
    container._registration = context.registration;
    container._sw = context.sw;
    container.api = context.api;
    container.scope = context.scope;

    // Create client for container
    container.scope.clients._connect(container._url, clientPostMessage.bind(null, container));
  });

  return Promise.resolve(container._registration);
}

/**
 * Unregister a ServiceWorker registration
 * @param {String} contextKey
 * @returns {Promise<Boolean>}
 */
function unregister(contextKey) {
  const context = contexts.get(contextKey);

  if (!context) {
    return Promise.resolve(false);
  }

  getContainersForContext(context).forEach(container => {
    container._registration = null;
    container._sw = null;
    container.api = null;
    container.scope = null;
    container.controller = null;
  });

  context.registration._destroy();
  context.sw._destroy();
  context.scope._destroy();

  contexts.delete(contextKey);

  return Promise.resolve(true);
}

/**
 * Send 'message' to client listeners
 * @param {ServiceWorkerContainer} container
 * @param {*} message
 * @param {Array} transferList
 * @returns {void}
 */
function clientPostMessage(container, message, transferList) {
  handle(container, 'message', message, transferList, container.controller);
}

/**
 * Send 'message' to active ServiceWorker
 * @param {ServiceWorkerContainer} container
 * @param {*} message
 * @param {Array} transferList
 * @returns {void}
 * */
function swPostMessage(container, message, transferList) {
  trigger(container, 'message', message, transferList);
}

/**
 * Trigger 'eventType' in current scope
 * @param {ServiceWorkerContainer} container
 * @param {String} eventType
 * @returns {Promise}
 */
function trigger(container, eventType, ...args) {
  const context = getContextForContainer(container);

  if (!context) {
    throw Error('no script registered yet');
  }

  const containers = getContainersForContext(context);

  switch (eventType) {
    case 'install':
      setState('installing', context, containers);
      break;
    case 'activate':
      setState('activating', context, containers);
      break;
    default:
    // No state mgmt necessary
  }

  const done = () => {
    switch (eventType) {
      case 'install':
        setState('installed', context, containers);
        break;
      case 'activate':
        setState('activated', context, containers);
        break;
      default:
      // No state mgmt necessary
    }
  };

  return handle(context.scope, eventType, ...args).then(result => {
    done();
    return result;
  });
}

/**
 * Store 'state'
 * @param {String} state
 * @param {Object} context
 * @param {Array} containers
 * @returns {void}
 */
function setState(state, context, containers) {
  // TODO: emit serviceworker.onstatechange events
  switch (state) {
    case 'installing':
      if (context.sw.state !== state) {
        throw Error('ServiceWorker already installed');
      }
      context.registration.installing = context.sw;
      setControllerForContainers(null, containers);
      break;
    case 'installed':
      context.sw.state = state;
      context.registration.installing = null;
      context.registration.waiting = context.sw;
      break;
    case 'activating':
      if (context.sw.state !== 'installed') {
        throw Error('ServiceWorker not yet installed');
      }
      context.sw.state = state;
      context.registration.activating = context.sw;
      setControllerForContainers(null, containers);
      break;
    case 'activated':
      context.sw.state = state;
      context.registration.waiting = null;
      context.registration.active = context.sw;
      setControllerForContainers(context.sw, containers);
      break;
    default:
      if (context.sw.state !== 'activated') {
        throw Error('ServiceWorker not yet active');
      }
  }
}

/**
 * Set 'controller' for 'containers'
 * @param {ServiceWorker} controller
 * @param {Array} containers
 * @returns {void}
 */
function setControllerForContainers(controller, containers) {
  for (const container of containers) {
    container.controller = controller;
  }
}

/**
 * Retrieve all containers associated with 'context'
 * @param {Object} context
 * @returns {Array}
 */
function getContainersForContext(context) {
  const results = [];

  for (const container of containers) {
    if (container._sw === context.sw) {
      results.push(container);
    }
  }

  return results;
}

/**
 * Retrieve all containers that fall under 'urlScope'
 * @param {String} urlScope
 * @returns {Array}
 */
function getContainersForUrlScope(urlScope) {
  const results = [];

  for (const container of containers) {
    if (container._url.indexOf(urlScope) === 0) {
      results.push(container);
    }
  }

  return results;
}

/**
 * Retrieve context for 'container'
 * @param {ServiceWorkerContainer} container
 * @returns {Object}
 */
function getContextForContainer(container) {
  for (const context of contexts.values()) {
    if (context.sw === container._sw) {
      return context;
    }
  }
  return null;
}

/**
 * Retrieve origin from 'urlString'
 * @param {String} urlString
 * @returns {String}
 */
function getOrigin(urlString) {
  const parsedUrl = url.parse(urlString);

  return `${parsedUrl.protocol}//${parsedUrl.host}`;
}

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
 * Retrieve 'importScripts' function
 * @param {Object} context
 * @returns {Function}
 */
function getImportScripts(context) {
  function importScript(script) {
    const caches = context.caches;
    const clients = context.clients;
    const clearImmediate = context.clearImmediate;
    const clearInterval = context.clearInterval;
    const clearTimeout = context.clearTimeout;
    const console = context.console;
    const fetch = context.fetch;
    const Request = context.Request;
    const Response = context.Response;
    const Headers = context.Headers;
    const indexedDB = context.indexedDB;
    const IDBCursor = context.IDBCursor;
    const IDBCursorWithValue = context.IDBCursorWithValue;
    const IDBDatabase = context.IDBDatabase;
    const IDBFactory = context.IDBFactory;
    const IDBIndex = context.IDBIndex;
    const IDBKeyRange = context.IDBKeyRange;
    const IDBObjectStore = context.IDBObjectStore;
    const IDBOpenDBRequest = context.IDBOpenDBRequest;
    const IDBRequest = context.IDBRequest;
    const IDBTransaction = context.IDBTransaction;
    const IDBVersionChangeEvent = context.IDBVersionChangeEvent;
    const location = context.location;
    const module = context.module;
    const exports = context.exports;
    const process = context.process;
    const registration = context.registration;
    const setImmediate = context.setImmediate;
    const setTimeout = context.setTimeout;
    const setInterval = context.setInterval;
    const self = context;
    const require = context.require;

    eval(script);
  }

  return function importScripts(...scripts) {
    scripts.forEach(script => {
      importScript.call(context, fs.readFileSync(path.join(context.location._webroot, script), 'utf8'));
    });
  };
}

/**
 * Retrieve the fully resolved path
 * @param {String} contextpath
 * @param {String} p
 * @returns {String}
 */
function getResolvedPath(contextpath, p) {
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
