'use strict';

const fs = require('fs');
const path = require('path');
const ServiceWorker = require('./lib/ServiceWorker');
const vm = require('vm');

const nativeRequire = require;

module.exports = {
  /**
   * Evaluate 'script' in ServiceWorker context
   * @param {String} scriptpath
   * @returns {ServiceWorker}
   */
  evalScript (scriptpath) {
    const isPath = !~scriptpath.indexOf('\n');
    const serviceWorker = new ServiceWorker();
    const sandbox = vm.createContext(Object.assign(serviceWorker, {
      console,
      process,
      // If not path, assume contextpath is this module's parent
      require: getRequire(isPath ? scriptpath : path.dirname(module.parent.filename))
    }));
    const script = isPath
      ? fs.readFileSync(scriptpath, 'utf8')
      : scriptpath;

    vm.runInContext(script, sandbox);

    return sandbox;
  },

  /**
   * Load module at 'modulepath' in ServiceWorker context
   * @param {String} modulepath
   * @returns {Module}
   */
  loadModule (modulepath) {
    const serviceWorker = new ServiceWorker();
    const module = { exports: {} };
    const sandbox = vm.createContext(Object.assign(serviceWorker, {
      console,
      module,
      exports: module.exports,
      process,
      require: getRequire(modulepath)
    }));
    const script = fs.readFileSync(modulepath, 'utf8');

    vm.runInContext(script, sandbox);

    return module.exports;
  }
};

function getRequire (contextpath) {
  const r = function require (requiredpath) {
    return nativeRequire(getRequiredPath(contextpath, requiredpath));
  };

  r.resolve = function resolve (requiredpath) {
    return nativeRequire.resolve(getRequiredPath(contextpath, requiredpath));
  };

  return r;
}

function getRequiredPath (contextpath, requiredpath) {
  return requiredpath.indexOf('.') == 0
    ? path.resolve(contextpath, requiredpath)
    : requiredpath;
}