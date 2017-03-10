'use strict';

const Client = require('./Client');

module.exports = class Clients {
  constructor () {
    this.clients = [];
  }

  /**
   * Gets a service worker client matching a given id and returns it
   * @param {string} id - the id of the wanted client
   * @returns {Promise<Client>} Resolves the client that has the given id.
   */
  get (id) {
    const client = this.clients.find((client) => {
      return client.id === id;
    });

    return Promise.resolve(client);
  }

  /**
   * Returns a Promise for a list of service worker clients.
   * @param {Object} options - An options object allowing you to set options for the matching operation. (not implemented yet)
   * @returns {Promise<[Client]>} Resolves to an array of Client objects.
   */
  matchAll () {
    return Promise.resolve(this.clients.slice());
  }

  /**
   * Creates a new top level browsing context and loads a given URL.
   * @param {string} url - the URL of the client you want to open in the window.
   * @returns {Promise<Client>} Resolves to a WindowClient object if the URL is from the same origin as the service worker or a null value otherwise.
   */
  openWindow (url) {
    const client = new Client(url);

    this.clients.push(client);

    return Promise.resolve(client);
  }

  /**
   * Allows an active Service Worker to set itself as the active worker for a client page when the worker and the page are in the same scope.
   * @returns {Promise}
   */
  claim () {
    return Promise.resolve();
  }
};