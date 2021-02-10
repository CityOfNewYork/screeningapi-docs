/**
 * Dependencies
 */
const nodeResolve = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');          // Replace content while bundling.

/**
 * Plugin configuration. Refer to the package for details on the available options.
 *
 * @source https://github.com/rollup/plugins
 *
 * @type {Object}
 */
let plugins = [
  replace({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
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
<<<<<<< HEAD
      file: './dist/js/source.js',
=======
      file: './dist/js/main.js',
>>>>>>> fc3eb4b... Modified implementation from CommonJS to ECMAScript
      name: 'MAIN',
      sourcemap: (process.env.NODE_ENV === 'production') ? false : 'inline',
      format: 'iife',
      strict: true
    }],
    plugins: plugins,
    devModule: true
  }
];
