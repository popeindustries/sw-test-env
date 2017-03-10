'use strict';

const fetch = require('node-fetch');
const Headers = require('./lib/Headers');
const path = require('path');
const Request = require('./lib/Request');
const Response = require('./lib/Response');
const ServiceWorkerContainer = require('./lib/ServiceWorkerContainer');

let activeContainer;

module.exports = {
  fetch,
  Headers,
  Request,
  Response,

  /**
   * Create ServiceWorkerContainer instance
   * @returns {ServiceWorkerContainer}
   */
  create () {
    if (activeContainer && activeContainer._registration) activeContainer._destroy();
    activeContainer = new ServiceWorkerContainer(path.dirname(module.parent.filename));
    return activeContainer;
  }
};