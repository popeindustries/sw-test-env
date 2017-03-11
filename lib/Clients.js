'use strict';

const Client = require('./Client');

module.exports = class Clients {
  /**
   * Constructor
   */
  constructor () {
    this.clients = [];
  }

  /**
   * Retrieve a client matching a given id
   * @param {String} id
   * @returns {Promise<Client>}
   */
  get (id) {
    return Promise.resolve(this.clients.find((client) => client.id == id));
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
    return Promise.resolve(this.clients.slice());
  }

  /**
   * Creates a new top level browsing context and loads 'url'
   * @param {string} url
   * @returns {Promise<Client>}
   */
  openWindow (url) {
    const client = new Client(url);

    this.clients.push(client);

    return Promise.resolve(client);
  }

  /**
   * Activate ServiceWorker for all clients
   * @returns {Promise}
   */
  claim () {
    return Promise.resolve();
  }

  _destroy () {
    this.clients = null;
  }
};