/**
 * Dependencies
 */
const path = require('path');
const global = require('./global');

/**
 * Sass Exports
 *
 * @type {Array}
 */
module.exports = [
  {
    file: path.join(global.base, global.src, global.entry.styles),
    outDir: path.join(global.base, global.dist, 'css') + '/',
    outFile: path.basename(global.entry.styles.replace('.scss', '.css')),
    sourceMapEmbed: (process.env.NODE_ENV === 'development'),
    includePaths: [
      'node_modules',
      'node_modules/@nycopportunity/patterns/src',
      'node_modules/@nycopportunity'
    ],
    devModule: true // This needs to be set if we want the module to be compiled during development
  }
];
