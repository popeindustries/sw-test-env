'use strict';

const fs = require('fs');
const path = require('path');

const RE_IMPORT = /importScripts\(([^)]+)\);?/g;
const RE_QUOTES = /['"]/g;
const RE_SPLIT = /,\s?/g;

/**
 * Inline all 'importScripts' in 'content'
 * @param {String} content
 * @param {String} webroot
 * @returns {String}
 */
module.exports = function importScripts(content, webroot) {
  const matches = [];
  let match;

  RE_IMPORT.lastIndex = 0;
  while ((match = RE_IMPORT.exec(content))) {
    const scriptPaths = match[1].replace(RE_QUOTES, '').split(RE_SPLIT);
    const importContent = scriptPaths.map((scriptPath) => {
      scriptPath = path.join(webroot, scriptPath);

      if (!fs.existsSync(scriptPath)) {
        throw Error(`error importing script "${scriptPath}"`);
      }
      return fs.readFileSync(scriptPath, 'utf8');
    });

    matches.push([match[0], importContent.join('\n')]);
  }

  matches.forEach(([statement, importContent]) => {
    content = content.replace(statement, importContent);
  });

  return content;
};
