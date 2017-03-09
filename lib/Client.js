'use strict';

const uuidV4 = require('uuid/v4');

module.exports = class Client {
  constructor (url) {
    this.url = url;
    this.id = uuidV4();
  }

  postMessage (message, transfer) {
    throw new Error('Not implemented yet');
  }
};