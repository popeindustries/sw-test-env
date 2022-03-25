/**
 * @typedef { Object } FetchEventInit
 * @property { Request } request
 * @property { Promise<Response> } [preloadResponse]
 * @property { string } [clientId]
 * @property { string } [resultingClientId]
 * @property { string } [replacesClientId]
 * @property { boolean } [isReload]
 */
import { contentType } from 'mime-types';
import ExtendableEvent from './ExtendableEvent.js';
import path from 'path';

export default class FetchEvent extends ExtendableEvent {
  /**
   * Constructor
   * @param { string } type
   * @param { FetchEventInit } init
   */
  constructor(type, init) {
    super(type);

    this.request = init.request;
    this.preloadResponse = init.preloadResponse ?? Promise.resolve(undefined);
    this.clientId = init.clientId ?? '';
    this.resultingClientId = init.resultingClientId ?? '';
    this.replacesClientId = init.replacesClientId ?? '';

    if (typeof init.request === 'string') {
      /** @type { string } */
      const href = init.request;
      const ext = path.extname(href.split('?')[0]) || '.html';
      const accept = contentType(ext) || '*/*';
      this.request = new Request(href, {
        headers: {
          accept,
        },
      });
    }
  }

  /**
   * Store response
   * @param { Promise<Response> } promise
   * @returns { void }
   */
  respondWith(promise) {
    this.promise = promise;
  }
}
