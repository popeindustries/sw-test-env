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
   * @param { string } origin
   * @param { FetchEventInit } init
   */
  constructor(type, origin, { clientId, request, resultingClientId, replacesClientId, preloadResponse }) {
    super(type);

    this.request = request;
    this.preloadResponse = preloadResponse ?? Promise.resolve(undefined);
    this.clientId = clientId ?? '';
    this.resultingClientId = resultingClientId ?? '';
    this.replacesClientId = replacesClientId ?? '';

    /** @type { URL } */
    let url;
    /** @type { RequestInit } */
    let requestInit;

    if (typeof request === 'string') {
      url = new URL(request, origin);
      const ext = path.extname(url.pathname) || '.html';
      const accept = contentType(ext) || '*/*';
      requestInit = {
        headers: {
          accept,
        },
      };
    } else {
      const { body, headers = {}, method = 'GET', redirect = 'follow' } = request;
      url = new URL(request.url, origin);
      requestInit = {
        body,
        headers,
        method,
        redirect,
      };
    }

    this.request = new Request(url.href, requestInit);
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
