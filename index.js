'use strict';

const { handle } = require('./lib/events');
const fetchFactory = require('./lib/fetchFactory');
const fs = require('fs');
const Headers = require('./lib/Headers');
const MessageChannel = require('./lib/MessageChannel');
const path = require('path');
const Request = require('./lib/Request');
const Response = require('./lib/Response');
const ServiceWorker = require('./ServiceWorker');
const ServiceWorkerContainer = require('./lib/ServiceWorkerContainer');
const ServiceWorkerGlobalScope = require('./ServiceWorkerGlobalScope');
const ServiceWorkerRegistration = require('./ServiceWorkerRegistration');
const url = require('url');
const vm = require('vm');

const DEFAULT_ORIGIN = 'http://localhost:3333';
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
   * @returns {ServiceWorkerContainer}
   */
  connect (url = DEFAULT_ORIGIN) {
    const origin = getOrigin(url);
    const container = new ServiceWorkerContainer(url, register, trigger);

    containers.add(container);

    return container;
  },

  destroy (url) {

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
function register (container, scriptURL, { scope = DEFAULT_SCOPE } = {}) {
  const origin = getOrigin(container._url);
  const scoped = url.resolve(origin, scope);

  if (contexts.has(scoped)) {

  }

  const fetch = fetchFactory(origin);
  const registration = new ServiceWorkerRegistration(unregister);
  const globalScope = new ServiceWorkerGlobalScope(registration, fetch, clientPostMessage.bind(this, container));
  const sw = new ServiceWorker(scriptURL, swPostMessage.bind(this, container));
  const context = Object.assign({ registration, sw }, load(scriptURL, globalScope, fetch));

  contexts.set(scoped, context);

  container._registration = registration;
  container._sw = context.sw;
  container.api = context.api;
  container.scope = context.scope;

  return Promise.resolve(registration);
}

function unregister () {

}

/**
 * Send 'message' to client listeners
 * @param {ServiceWorkerContainer} container
 * @param {*} message
 * @param {Array} transferList
 */
function clientPostMessage (container, message, transferList) {
  // TODO: handle onmessage format
  if (this._listeners.message) {
    this._listeners.message.forEach((fn) => fn(new MessageEvent(message, transferList, this.controller)));
  }
}

/**
 * Send 'message' to active ServiceWorker
 * @param {ServiceWorkerContainer} container
 * @param {*} message
 * @param {Array} transferList
 */
function swPostMessage (container, message, transferList) {
  this.trigger('message', message, transferList);
}

/**
 * Load and execute script at 'scriptURL'
 * @param {String} scriptURL
 * @param {ServiceWorkerGlobalScope} globalScope
 * @param {Function} fetch
 * @returns {Object}
 */
function load (scriptURL, globalScope, fetch) {
  const isPath = !~scriptURL.indexOf('\n');
  const contextpath = isPath ? getResolvedPath(parentPath, scriptURL) : parentPath;
  const script = isPath
    ? fs.readFileSync(isRelativePath(scriptURL) ? path.resolve(parentPath, scriptURL) : scriptURL, 'utf8')
    : scriptURL;
  const scriptModule = { exports: {} };
  const sandbox = vm.createContext(Object.assign(globalScope, {
    clearImmediate,
    clearInterval,
    clearTimeout,
    console,
    fetch,
    Request,
    Response,
    Headers,
    module: scriptModule,
    exports: scriptModule.exports,
    process,
    setImmediate,
    setTimeout,
    setInterval,
    self: globalScope,
    require: getRequire(contextpath)
  }));

  vm.runInContext(script, sandbox);

  return {
    api: scriptModule.exports,
    scope: sandbox
  };
}

/**
 * Trigger 'eventType' in current scope
 * @param {String} eventType
 * @returns {Promise}
 */
function trigger (eventType, ...args) {
  if (!this._registration) throw Error('no script registered yet');
  switch (eventType) {
    case 'install':
      setState('installing');
      break;
    case 'activate':
      setState('activating');
      break;
  }

  const done = () => {
    switch (eventType) {
      case 'install':
        setState('installed');
        break;
      case 'activate':
        setState('activated');
        break;
    }
  };

  // TODO: handle alternative on* methods
  if (this.scope._listeners[eventType]) {
    return handle(this.scope._listeners, eventType, ...args)
      .then((result) => {
        done();
        return result;
      });
  }

  done();

  return Promise.resolve();
}

/**
 * Store 'state'
 * @param {String} state
 */
function setState (state) {
  switch (state) {
    case 'installing':
      if (this._sw.state != state) throw Error('ServiceWorker already installed');
      this._registration.installing = this._sw;
      this.controller = null;
      break;
    case 'installed':
      this._sw.state = state;
      this._registration.installing = null;
      this._registration.waiting = this._sw;
      break;
    case 'activating':
      if (this._sw.state != 'installed') throw Error('ServiceWorker not yet installed');
      this._sw.state = state;
      this._registration.activating = this._sw;
      this.controller = null;
      break;
    case 'activated':
      this._sw.state = state;
      this._registration.waiting = null;
      this._registration.active = this._sw;
      this.controller = this._sw;
      break;
    default:
      if (this._sw.state != 'activated') throw Error('ServiceWorker not yet active');
      break;
  }
}

/**
 * Retrieve origin from 'urlString'
 * @param {String} urlString
 * @returns {String}
 */
function getOrigin (urlString) {
  const parsedUrl = url.parse(urlString);

  return parsedUrl.protocol + parsedUrl.hostname + (parsedUrl.port ? `:${parsedUrl.port}` : '');
}

/**
 * Retrieve 'require' function for 'contextpath'
 * @param {String} contextpath
 * @returns {Function}
 */
function getRequire (contextpath) {
  const r = function require (requiredpath) {
    return nativeRequire(getResolvedPath(contextpath, requiredpath));
  };

  r.resolve = function resolve (requiredpath) {
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
function getResolvedPath (contextpath, p) {
  return isRelativePath(p)
    ? path.resolve(contextpath, p)
    : p;
}

/**
 * Determine if 'p' is relative path
 * @param {String} p
 * @returns {Boolean}
 */
function isRelativePath (p) {
  return p.indexOf('.') == 0;
}