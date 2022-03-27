import Client from './Client.js';
import WindowClient from './WindowClient.js';

/**
 * @implements MockClients
 */
export default class Clients {
  constructor() {
    /** @type { Array<Client> } */
    this._clients = [];
  }

  /**
   * Retrieve a client matching a given id
   * @param { string } id
   * @returns { Promise<Client | undefined> }
   */
  async get(id) {
    return this._clients.find((client) => client.id === id);
  }

  /**
   * Retrieve all matching clients
   * @param { { includeUncontrolled?: boolean, type?: string }} [options]
   * @returns { Promise<Array<Client>> }
   */
  async matchAll({ type = 'any' } = {}) {
    // TODO: handle `includeUncontrolled`
    return this._clients.filter((client) => type === 'any' || client.type === type);
  }

  /**
   * Creates a new top level browsing context and loads 'url'
   * @param { string } url
   * @returns { Promise<WindowClient> }
   */
  async openWindow(url) {
    const client = new WindowClient(url);

    this._clients.push(client);

    return client;
  }

  /**
   * Activate ServiceWorker for all clients
   * @returns { Promise<void> }
   */
  claim() {
    return Promise.resolve();
  }

  /**
   * Create new client on connect
   * @param { string } url
   * @param { (message: unknown, transferList: Array<unknown>) => void } postMessage
   */
  _connect(url, postMessage) {
    this._clients.push(new Client(url, postMessage));
  }

  _destroy() {
    this._clients = [];
  }
}
