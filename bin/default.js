#!/usr/bin/env node

/**
 * Dependencies
 */

const concurrently = require('concurrently');

/**
 * Args
 */

const arguments = require('@nycopportunity/pttrn/bin/util/args');
const args = arguments.args;
const dict = arguments.dict;

const flags = dict.map(d => (args[d.name]) ? d.flags[0] : '')
  .filter(f => f != '').join(' ');

/**
 * Constants
 */

const scripts = [
  'styles',
  'rollup',
  'twig',
  'svgs'
];

const opts = {
  prefix: 'none',
  raw: true
};

/**
 * Main task
 */
const main = () => {
  concurrently(scripts.map(s =>
    `node_modules/@nycopportunity/pttrn/bin/cli.js ${s} ${flags}`), opts);
};

/**
 * Runner
 */
const run = () => {
  main();
};

/**
 * Export our methods
 *
 * @type {Object}
 */
module.exports = {
  main: main,
  run: run
};
