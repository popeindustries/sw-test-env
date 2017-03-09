'use strict';

const fs = require('fs');
const path = require('path');
const ServiceWorker = require('./lib/ServiceWorker');
const vm = require('vm');

const nativeRequire = require;

/**
 * Evaluate 'scriptpath' in ServiceWorker context
 * 'scriptpath' can be path or String of js code
 * @param {String} scriptpath
 * @returns {Object}
 */
module.exports = function pseudoServiceWorker (scriptpath) {
  const isPath = !~scriptpath.indexOf('\n');
  const parentpath = path.dirname(module.parent.filename);
  const contextpath = isPath ? getResolvedPath(parentpath, scriptpath) : parentpath;
  const script = isPath
    ? fs.readFileSync(isRelativePath(scriptpath) ? path.resolve(parentpath, scriptpath) : scriptpath, 'utf8')
    : scriptpath;
  const scriptModule = { exports: {} };
  const serviceWorker = new ServiceWorker();
  const sandbox = vm.createContext(Object.assign(serviceWorker, {
    console,
    module: scriptModule,
    exports: scriptModule.exports,
    process,
    require: getRequire(contextpath)
  }));

  vm.runInContext(script, sandbox);

  return { serviceWorker: sandbox, module: scriptModule.exports };
};

/**
 * Retrieve 'require' function for 'contextpath'
 * @param {String} contextpath
 * @returns {Function}
 */
function getRequire (contextpath) {
  const r = function require (requiredpath) {
    return nativeRequire(getResolvedPath(contextpath, requiredpath));
  };

  r.resolve = function resolve (requiredpath) {
    return nativeRequire.resolve(getResolvedPath(contextpath, requiredpath));
  };

  return r;
}

/**
 * Retrieve the fully resolved path
 * @param {String} contextpath
 * @param {String} p
 * @returns {String}
 */
function getResolvedPath (contextpath, p) {
  return isRelativePath(p)
    ? path.resolve(contextpath, p)
    : p;
}

/**
 * Determine if 'p' is relative path
 * @param {String} p
 * @returns {Boolean}
 */
function isRelativePath (p) {
  return p.indexOf('.') == 0;
}