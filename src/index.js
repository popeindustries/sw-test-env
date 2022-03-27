/**
 * @typedef { Object } Context
 * @property { import('./api/ServiceWorkerRegistration').default } registration
 * @property { import('./api/ServiceWorker').default } sw
 * @property { import('./api/ServiceWorkerGlobalScope').default & Record<string, unknown> } scope
 */
import './polyfills.js';
import createContext from './createContext.js';
import esbuild from 'esbuild';
import { handle } from './events.js';
import path from 'path';
import ServiceWorker from './api/ServiceWorker.js';
import ServiceWorkerContainer from './api/ServiceWorkerContainer.js';
import ServiceWorkerGlobalScope from './api/ServiceWorkerGlobalScope.js';
import ServiceWorkerRegistration from './api/ServiceWorkerRegistration.js';
import vm from 'vm';

const DEFAULT_ORIGIN = 'http://localhost:3333/';
const DEFAULT_SCOPE = '/';

/** @type { Set<ServiceWorkerContainer> } */
const containers = new Set();
/** @type { Map<string, Context > } */
const contexts = new Map();

export { Headers, Request, Response } from 'node-fetch';

/**
 * Create/retrieve ServiceWorkerContainer instance for `origin`
 * @param { string } [origin]
 * @param { string } [webroot]
 * @returns { Promise<ServiceWorkerContainer> }
 */
export async function connect(origin = DEFAULT_ORIGIN, webroot = process.cwd()) {
  if (!origin.endsWith('/')) {
    origin += '/';
  }

  const container = new ServiceWorkerContainer(origin, webroot, register, trigger);

  containers.add(container);
  // TODO: check if active context and apply state
  return container;
}

/**
 * Destroy all active containers/contexts
 * @returns { Promise<void> }
 */
export async function destroy() {
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

/**
 * Register ServiceWorker script at 'scriptURL'
 * @param { ServiceWorkerContainer } container
 * @param { string } scriptURL
 * @param { { scope?: string } } [options]
 * @returns { Promise<MockServiceWorkerRegistration> }
 */
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
    const sw = new ServiceWorker(scriptURL, swPostMessage.bind(null, container));
    const scriptPath = isRelativePath(scriptURL) ? path.resolve(webroot, scriptURL) : scriptURL;
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
      const sandbox = /** @type { ServiceWorkerGlobalScope & Record<string, unknown> } */ (vm.createContext(vmContext));
      vm.runInContext(bundledSrc.outputFiles[0].text, sandbox);

      context = {
        registration,
        scope: sandbox,
        sw,
      };
      contexts.set(scopeHref, context);
    } catch (err) {
      throw /** @type { Error } */ (err).message.includes('importScripts')
        ? Error('"importScripts" not supported in esm ServiceWorker. Use esm "import" statement instead')
        : err;
    }
  }

  for (const container of getContainersForUrlScope(scopeHref)) {
    container._registration = context.registration;
    container._sw = context.sw;
    container.scope = context.scope;

    // @ts-ignore
    // Create client for container
    container.scope.clients._connect(container._href, clientPostMessage.bind(null, container));
  }

  return container._registration;
}

/**
 * Unregister a ServiceWorker registration
 * @param { string } contextKey
 * @returns { Promise<boolean> }
 */
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

/**
 * Send 'message' to client listeners
 * @param { ServiceWorkerContainer } container
 * @param { unknown } message
 * @param { Array<unknown> } transferList
 */
function clientPostMessage(container, message, transferList) {
  handle(container, 'message', message, transferList, container.controller);
}

/**
 * Send 'message' to active ServiceWorker
 * @param { ServiceWorkerContainer } container
 * @param { unknown } message
 * @param { Array<unknown> } transferList
 * */
function swPostMessage(container, message, transferList) {
  trigger(container, 'message', '', message, transferList);
}

/**
 * Trigger 'eventType' in current scope
 * @param { ServiceWorkerContainer } container
 * @param { string } origin
 * @param { string } eventType
 * @param { Array<unknown> } args
 * @returns { Promise<unknown> }
 */
async function trigger(container, origin, eventType, ...args) {
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
    case 'fetch':
      args.unshift(origin);
      break;
    default:
    // No state mgmt necessary
  }

  const result = await handle(context.scope, eventType, ...args);

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

  return result;
}

/**
 * Store 'state'
 * @param { string } state
 * @param { Context } context
 * @param { Array<ServiceWorkerContainer> } containers
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
 * @param { ServiceWorker | null } controller
 * @param { Array<ServiceWorkerContainer> } containers
 */
function setControllerForContainers(controller, containers) {
  for (const container of containers) {
    container.controller = controller;
  }
}

/**
 * Retrieve all containers associated with 'context'
 * @param { Context } context
 * @returns { Array<ServiceWorkerContainer> }
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
 * @param { string } urlScope
 * @returns { Array<ServiceWorkerContainer> }
 */
function getContainersForUrlScope(urlScope) {
  const results = [];

  for (const container of containers) {
    if (container._href.indexOf(urlScope) === 0) {
      results.push(container);
    }
  }

  return results;
}

/**
 * Retrieve context for 'container'
 * @param { ServiceWorkerContainer } container
 * @returns { Context | undefined }
 */
function getContextForContainer(container) {
  for (const context of contexts.values()) {
    if (context.sw === container._sw) {
      return context;
    }
  }
}

/**
 * Retrieve origin from 'urlString'
 * @param { string } urlString
 * @returns { string }
 */
function getOrigin(urlString) {
  const parsedUrl = new URL(urlString);

  return `${parsedUrl.protocol}//${parsedUrl.host}`;
}

/**
 * Retrieve the fully resolved path
 * @param { string } contextPath
 * @param { string } p
 * @returns { string }
 */
function getResolvedPath(contextPath, p) {
  return isRelativePath(p) ? path.resolve(contextPath, p) : p;
}

/**
 * Determine if 'p' is relative path
 * @param { string } p
 * @returns { boolean }
 */
function isRelativePath(p) {
  return !path.isAbsolute(p);
}
