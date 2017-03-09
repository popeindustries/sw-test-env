'use strict';

const Client = require('./Client');

module.exports = class Clients {
  constructor () {
    this.clients = [];
  }

  /**
   * Gets a service worker client matching a given id and returns it
   *
   * @param {string} id - the id of the wanted client
   * @returns {Promise} Resolves the client that has the given id.
   */
  get (id) {
    const client = this.clients.find((client) => {
      return client.id === id;
    });

    return Promise.resolve(client);
  }

  /**
   * Creates a new top level browsing context and loads a given URL.
   * @param {string} url - the URL of the client you want to open in the window.
   * @returns {Promise} Resolves to a WindowClient object if the URL is from the same origin as the service worker or a null value otherwise.
   */
  openWindow (url) {
    const client = new Client(url);

    this.clients.push(client);

    return Promise.resolve(client);
  }
};