/// <reference types="node" />

/**
 * Create/retrieve `ServiceWorkerContainer` instance for `origin`.
 * @param origin - the origin under which to host the service worker (default is `http://localhost:3333`)
 * @param webroot - the filepath used to resolve path to service worker on disk when registering (default is `process.cwd`)
 */
declare function connect(origin?: string, webroot?: string): Promise<MockServiceWorkerContainer>;

/**
 * Destroy all active `ServiceWorkerContainer` instances and their associated `ServiceWorker` contexts
 */
declare function destroy(): Promise<void>;
