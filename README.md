[![NPM Version](https://img.shields.io/npm/v/sw-test-env.svg?style=flat)](https://npmjs.org/package/sw-test-env)
[![Build Status](https://img.shields.io/travis/yr/sw-test-env.svg?style=flat)](https://travis-ci.org/yr/sw-test-env)

# ServiceWorker Test Environment

A sandboxed `ServiceWorker` context for testing `ServiceWorker` code on the command line.

Testing code written to run in a `ServiceWorker` is hard, and generally requires a browser environment and lots of ceremony to work. `sw-test-env` is the magic ingredient for easy unit/integration testing of `ServiceWorker` code. Just load your script, and poke, prod, inspect, and manipulate the returned context:

```js
const assert = require('assert');
const pseudoServiceWorker = require('pseudo-service-worker');

// Load and execute sw.js in a sandboxed ServiceWorker context
const { serviceWorker } = pseudoServiceWorker('./path/to/sw.js');

// Trigger the 'install' event and inspect the cache contents
serviceWorker.trigger('install')
  .then(() => serviceWorker.caches.open('v1'))
  .then((cache) => cache.keys())
  .then((requests) => {
    const urls = requests.map((request) => request.url);
    assert.ok(urls.includes('assets/index.js'));
  });
```

## API

**`pseudoServiceWorker(scriptpath: String): Object`** load and execute `scriptpath` in a mock `ServiceWorker` context. `scriptpath` may be a relative or absolute filepath, or a string of code to be parsed and executed.

The loaded script will have access to `self` and all relevant `Worker/ServiceWorker` apis:

- [`caches`](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage)
- [`clients`](https://developer.mozilla.org/en-US/docs/Web/API/Clients)
- [`registration`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration)
- [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)
- [`skipWaiting()`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting)
- `addEventListener()`
- `postMessage()`

In addition, the loaded script will also have access to `require`, `module`, and `exports`. As a result, script code that normally requires bundling for the browser (Webpack, Browserify, etc) can be tested without a build step.

Returns a `context` object with the following properties:

- **`serviceWorker: ServiceWorker`** the `ServiceWorker` instance (roughly equivalent to [ServiceWorkerGlobalScope](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope))
- **`module: Object`** the exported `module.exports` api
- **`fetch: Function`** the global `fetch` method
- **`Request: Constructor`** the `Request` class constructor
- **`Response: Constructor`** the `Response` class constructor
- **`Headers: Constructor`** the `Headers` class constructor

## Testing

## Inspiration

Special thanks goes to Pinterest ([service-worker-mock](https://github.com/pinterest/service-workers/tree/master/packages/service-worker-mock)) and Nolan Lawson ([pseudo-worker](https://github.com/nolanlawson/pseudo-worker)) for their inspiring work and borrowed code.