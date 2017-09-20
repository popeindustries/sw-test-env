'use strict';

const { handle } = require('./lib/events');
const createContext = require('./lib/createContext');
const fetchFactory = require('./lib/fetchFactory');
const fs = require('fs');
const Headers = require('./lib/Headers');
const importScripts = require('./lib/importScripts');
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
const testroot = findRootTestDir();

module.exports = {
  Headers,
  MessageChannel,
  Request,
  Response,

  /**
   * Create/retrieve ServiceWorkerContainer instance for 'domain'
   * @param {String} [url]
   * @param {String} [webroot]
   * @returns {Promise<ServiceWorkerContainer>}
   */
  connect(url = DEFAULT_ORIGIN, webroot = process.cwd()) {
    if (url.slice(-1) !== '/') {
      url += '/';
    }

    const container = new ServiceWorkerContainer(url, webroot, register, trigger);

    containers.add(container);
    // TODO: check if active context and apply state
    return Promise.resolve(container);
  },

  /**
   * Destroy all active containers/contexts
   * @returns {Promise}
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
    return Promise.resolve();
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
    const contextPath = isPath ? getResolvedPath(testroot, scriptURL) : testroot;
    const contextLocation = url.parse(path.join(origin, isPath ? scriptURL : 'sw.js').replace(/:\//, '://'));
    const fetch = fetchFactory(origin);
    const registration = new ServiceWorkerRegistration(unregister.bind(null, urlScope));
    const globalScope = new ServiceWorkerGlobalScope(registration, fetch, origin);
    const sw = new ServiceWorker(isPath ? scriptURL : '', swPostMessage.bind(null, container));
    let script = isPath
      ? fs.readFileSync(isRelativePath(scriptURL) ? path.resolve(testroot, scriptURL) : scriptURL, 'utf8')
      : scriptURL;

    script = importScripts(script, container._webroot);
    contextLocation.origin = origin;
    contextLocation._webroot = container._webroot;
    context = createContext(globalScope, contextLocation, contextPath, origin, fetch);

    const sandbox = vm.createContext(context);

    vm.runInContext(script, sandbox);

    context = {
      api: context.module.exports,
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
  // TODO: fully qualify 'fetch' event urls
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
      if (context.sw.state !== 'installing') {
        return;
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
      if (!context.sw.state.includes('install')) {
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
 * Retrieve the fully resolved path
 * @param {String} contextPath
 * @param {String} p
 * @returns {String}
 */
function getResolvedPath(contextPath, p) {
  return isRelativePath(p) ? path.resolve(contextPath, p) : p;
}

/**
 * Determine if 'p' is relative path
 * @param {String} p
 * @returns {Boolean}
 */
function isRelativePath(p) {
  return p.indexOf('.') === 0;
}

function findRootTestDir() {
  let main = module.parent;
  let dir = '';

  while (main) {
    dir = path.dirname(main.filename);
    main = !main.parent || main.parent.filename.includes('node_modules') ? null : main.parent;
  }

  return dir;
}