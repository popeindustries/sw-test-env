[![NPM Version](https://img.shields.io/npm/v/sw-test-env.svg?style=flat)](https://npmjs.org/package/sw-test-env)
[![Build Status](https://img.shields.io/travis/popeindustries/sw-test-env.svg?style=flat)](https://github.com/popeindustries/sw-test-env/actions)

# ServiceWorker Test Environment

A sandboxed `ServiceWorker` context for testing your `ServiceWorker` code on the command line.

Testing code written to run in a `ServiceWorker` is hard, and generally requires a browser environment and lots of ceremony to work. `sw-test-env` is the magic ingredient for easy unit/integration testing of `ServiceWorker` code. Just load your script, and poke, prod, inspect, and manipulate the `ServiceWorker` context:

```js
import assert from 'assert';
import { connect } from 'sw-test-env';

// Equivalent to opening a browser window and accessing window.navigator.serviceWorker
const sw = connect('http://localhost:3000', 'path/to/webroot');

async function test() {
  // Load and execute sw.js in a sandboxed ServiceWorker context
  const registration = await sw.register('sw.js');
  // Trigger the 'install' event
  await sw.trigger('install');
  // Inspect the cache contents by reading from the installing service worker's internal scope
  const cache = await sw.__serviceWorker__.self.caches.open('v1');
  const requests = await cache.keys();
  const urls = requests.map((request) => request.url);
  assert.ok(urls.includes('assets/index.js'));
}
```

## Features

- load and execute `ServiceWorker` script files in a sandboxed context
- inspect the properties of the `ServiceWorker` scope (`clients`, `caches`, `registration`, variables, etc)
- manually trigger events on `ServiceWorker` (`install`, `activate`, `fetch`, `error`, etc)
- connect multiple clients
- register multiple, scoped `ServiceWorker` instances
- `postMessage` between clients and registered `ServiceWorker` instances
- use `indexedDB`
- TODO: register for notifications and push messages to connected clients

## Caveats

- limited `Response` streaming and body conversion (uses the primitives from [node-fetch](https://github.com/bitinn/node-fetch))
- `fetch` calls will be executed, so a request mocking tool like [nock](https://github.com/node-nock/nock) is recommended
- `importScripts()` in service worker files not supported (use `import` statements instead)
- requires at least version 16 of Node
- not yet possible to cache based on `VARY` header
- not tested against spec test suite or specific browser behaviour

## API

#### **`connect(url: string, webroot: string): Promise<MockServiceWorkerContainer>`**

Create a new `MockServiceWorkerContainer` instance at `url` (default is `http://localhost:3333/`) with `webroot` (default is current working directory). This is equivalent to opening a browser at `url` and accessing the `window.navigator.serviceworker` object. See [MockServiceWorkerContainer](#mockserviceworkercontainer) below for additional behaviour.

Multiple connections to same/different origins are supported, with access to `MockServiceWorker` instances determined by `scope`.

**Note**: the `webroot` argument is used to resolve the path for registering the `MockServiceWorker`.

#### **`destroy(): Promise<void>`**

Destroy all active `MockServiceWorkerContainer` instances and their registered `MockServiceWorker` instances. Should generally be called after each test (for example, in `afterEach()` when using Mocha/Jest/etc).

#### **`Headers, MessageChannel, Request, Response`**

Classes for creating instances of `Headers`, `MessageChannel`, `Request`, and `Response` to be used when interacting with the `MockServiceWorker` context.

### MockServiceWorkerContainer

In addition to the behaviour documented [here](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer), a `MockServiceWorkerContainer` instance returned by `connect()` has the following additions:

#### **`register(scriptURL: String, options: { scope: string }): Promise<MockServiceWorkerRegistration>`**

Load and execute `scriptURL` in a `MockServiceWorker` context. `scriptURL` may be a relative or absolute filepath.

**`options`** include:

- **`scope: String`** the `MockServiceWorker` registration scope (defaults to `./`). Multiple `MockServiceWorker` instances can be registered on the same origin with different scopes.

#### **`ready: Promise<void>`**

Force registered script to `install` and `activate`:

```js
const registration = await sw.register('sw.js');
await sw.ready;
assert.equal(sw.controller.state, 'activated');
```

#### **`trigger(eventType: 'install' | 'activate'): Promise<void>`**

#### **`trigger(eventType: 'fetch', options: FetchEventInit): Promise<Response>`**

#### **`trigger(eventType: 'error' | 'unhandledrejection', error: Error): Promise<void>`**

Manually trigger an event in the `MockServiceWorker` scope:

```js
const registration = await sw.register('sw.js');
await sw.ready;
const response = await sw.trigger('fetch', { request: '/assets/index.js' });
assert.equal(response.url, 'http://localhost:3333/assets/index.js');
```

#### **`__serviceWorker__: MockServiceWorker`**

Access the registered `MockServiceWorker`, including it's internal `self` scope:

```js
const registration = await sw.register('sw.js');
await sw.ready;
const cache = sw.__serviceWorker__.self.caches.open('v1');
const requests = await cache.keys();
const urls = requests.map((request) => request.url);
assert.ok(urls.includes('assets/index.js'));
```

## Inspiration & Thanks

Special thanks goes to Pinterest ([service-worker-mock](https://github.com/pinterest/service-workers/tree/master/packages/service-worker-mock)) and Nolan Lawson ([pseudo-worker](https://github.com/nolanlawson/pseudo-worker)) for their ideas (some of which were borrowed here) and inspiring work.
