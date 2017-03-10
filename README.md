[![NPM Version](https://img.shields.io/npm/v/sw-test-env.svg?style=flat)](https://npmjs.org/package/sw-test-env)
[![Build Status](https://img.shields.io/travis/YR/sw-test-env.svg?style=flat)](https://travis-ci.org/YR/sw-test-env)

# ServiceWorker Test Environment

A sandboxed `ServiceWorker` context for testing your `ServiceWorker` code on the command line.

Testing code written to run in a `ServiceWorker` is hard, and generally requires a browser environment and lots of ceremony to work. `sw-test-env` is the magic ingredient for easy unit/integration testing of `ServiceWorker` code. Just load your script, and poke, prod, inspect, and manipulate the returned context:

```js
const assert = require('assert');
const createSW = require('sw-test-env').create;
const sw = createSW();

// Load and execute sw.js in a sandboxed ServiceWorker context
sw.register('./path/to/sw.js')
  // Trigger the 'install' event and inspect the cache contents
  .then((registration) => sw.trigger('install'))
  // Inspect the cache
  .then(() => sw.scope.caches.open('v1'))
  .then((cache) => cache.keys())
  .then((requests) => {
    const urls = requests.map((request) => request.url);
    assert.ok(urls.includes('assets/index.js'));
  });
```

## API

#### **`create(): ServiceWorkerContainer`** 

Create a new `ServiceWorkerContainer` instance. If there is an existing active container, it will be first destroyed.

### ServiceWorkerContainer

#### **`sw.register(scriptURL: String, options: Object): Promise`** 

Load and execute `scriptURL` in a mock `ServiceWorker` context. `scriptURL` may be a relative or absolute filepath, or a string of code to be parsed and executed.

In addition to all the normal global apis available to a `ServiceWorker`, the loaded script will also have access to `require`, `module`, and `exports`. As a result, script code that normally requires bundling for the browser (with Webpack, Browserify, et al) can be tested without a build step.

**`options`** include:

- **`baseURL: String`** the base URL to prepend to all relative URLs passed to `fetch()` (defaults to `http://127.0.0.1:3333`)
- **`scope: String`** the `ServiceWorker` registration scope (defaults to `/`)

#### **`sw.ready: Promise`** 

Force registered script to `install` and `activate`:

```js
sw.register('./path/to/sw.js')
  .then((registration) => sw.ready)
  .then(() => {
    assert.equal(sw.controller.state, 'activated');
  });
```

#### **`sw.trigger(eventType: String, ...args): Promise`** 

Manually trigger an event (`install`, `activate`, `fetch`, `error`) in the `ServiceWorker` scope:

```js
sw.register('./path/to/sw.js')
  .then((registration) => sw.ready)
  .then((registration) => sw.trigger('fetch', 'assets/index.js'))
  .then((response) => {
    assert.equal(response.url, 'assets/index.js');
  });
```

#### **`sw.scope: ServiceWorkerGlobalScope`** 

Access the scope in which the registered script is running in. The following are available:

- [`caches`](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage)
- [`clients`](https://developer.mozilla.org/en-US/docs/Web/API/Clients)
- [`registration`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration)
- [`skipWaiting()`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting)

#### **`sw.api: Object`** 

If a registered script exposes a module api (via `module` and `exports`), you can access the result as `api`:

```js
sw.register('./path/to/sw-utils.js')
  .then((registration) => sw.ready)
  .then((registration) => {
    sw.api.someUtilFn();
  });
```

## Inspiration

Special thanks goes to Pinterest ([service-worker-mock](https://github.com/pinterest/service-workers/tree/master/packages/service-worker-mock)) and Nolan Lawson ([pseudo-worker](https://github.com/nolanlawson/pseudo-worker)) for their inspiring work.