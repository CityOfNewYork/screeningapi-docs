/**
 * Dependencies
 */
const nodeResolve = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');          // Replace content while bundling.
const pkg = require('../package.json');

/**
 * Plugin configuration. Refer to the package for details on the available options.
 *
 * @source https://github.com/rollup/plugins
 *
 * @type {Object}
 */
// console.dir(pkg.cdn.base.raw);
let plugins = [
  replace({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'CDN_BASE': JSON.stringify(pkg.cdn.base.raw),
    'CDN': JSON.stringify(pkg.cdn.content[process.env.NODE_ENV])
  }),
  nodeResolve.nodeResolve({
    browser: true,
    customResolveOption: {
      moduleDirectories: [
        'node_modules'
      ]
    }
  })
];

/**
 * ES Module Exports
 *
 * @type {Array}
 */
module.exports = [
  {
    input: './src/js/main.js',
    output: [{
      file: './dist/js/source.js',
      name: 'MAIN',
      sourcemap: (process.env.NODE_ENV === 'production') ? false : 'inline',
      format: 'iife',
      strict: true
    }],
    plugins: plugins,
    devModule: true
  }
];
