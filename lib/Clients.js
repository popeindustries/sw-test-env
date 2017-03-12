'use strict';

const Client = require('./Client');

module.exports = class Clients {
  /**
   * Constructor
   */
  constructor () {
    this._clients = [];
  }

  /**
   * Retrieve a client matching a given id
   * @param {String} id
   * @returns {Promise<Client>}
   */
  get (id) {
    return Promise.resolve(this._clients.find((client) => client.id == id));
  }

  /**
   * Retrieve all matching clients
   * @param {Object} options
   *  - {Boolean} includeUncontrolled
   *  - {String} type
   * @returns {Promise<[Client]>}
   */
  matchAll (options) {
    // TODO: filter based on options?
    return Promise.resolve(this._clients.slice());
  }

  /**
   * Creates a new top level browsing context and loads 'url'
   * @param {string} url
   * @returns {Promise<Client>}
   */
  openWindow (url) {
    const client = new Client(url);

    this._clients.push(client);

    return Promise.resolve(client);
  }

  /**
   * Activate ServiceWorker for all clients
   * @returns {Promise}
   */
  claim () {
    return Promise.resolve();
  }

  /**
   * Create new client on connect
   * @param {string} url
   * @param {Function} postMessage
   */
  _connect (url, postMessage) {
    this._clients.push(new Client(url, postMessage));
  }

  _destroy () {
    this._clients = null;
  }
};