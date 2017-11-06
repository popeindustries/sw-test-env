'use strict';

const fs = require('fs');
const path = require('path');

const RE_COMMENT_SINGLE_LINE = /^\s*(?:\/\/|#).+$/gm;
const RE_COMMENT_MULTI_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;
const RE_IMPORT = /(?:self\.)?importScripts\(([\s\S]*?)\);?/gm;
const RE_QUOTES = /['"]/g;
const RE_SPLIT = /,\s?/g;
const RE_$ = /\$/g;

/**
 * Inline all 'importScripts' in 'content'
 * @param {String} content
 * @param {String} webroot
 * @returns {String}
 */
module.exports = function importScripts(content, webroot) {
  const matches = [];
  let match;

  // Strip comments
  content = content.replace(RE_COMMENT_SINGLE_LINE, '');
  content = content.replace(RE_COMMENT_MULTI_LINES, '');

  RE_IMPORT.lastIndex = 0;

  while ((match = RE_IMPORT.exec(content))) {
    const scriptPaths = match[1].replace(RE_QUOTES, '').split(RE_SPLIT);
    const importContent = scriptPaths.map(scriptPath => {
      if (scriptPath.charAt(0) == '/') {
        scriptPath = scriptPath.slice(1);
      }
      scriptPath = path.join(webroot, scriptPath);

      if (!fs.existsSync(scriptPath)) {
        throw Error(`error importing script "${scriptPath}"`);
      }
      // Load and escape '$'
      return fs.readFileSync(scriptPath, 'utf8').replace(RE_$, '$$$');
    });

    matches.push([match[0], importContent.join('\n')]);
  }

  matches.forEach(([statement, importContent]) => {
    content = content.replace(statement, importContent);
  });

  return content;
};
