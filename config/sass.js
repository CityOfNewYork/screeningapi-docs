/**
 * Sass Exports
 *
 * @type {Array}
 */
module.exports = [
  {
    file: 'src/scss/style.scss',
    outDir: 'dist/css/',
    outFile: 'style.css',
    sourceMapEmbed: true,
    includePaths: [
      'node_modules',
      'node_modules/@nycopportunity/patterns/src',
      'node_modules/@nycopportunity'
    ],
    devModule: true // This needs to be set if we want the module to be compiled during development
  }
];
