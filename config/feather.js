const path = require('path');
const global = require('./global');

module.exports = {
  'src': path.join(process.env.PWD, 'node_modules/feather-icons/dist/icons'),
  'dist': path.join(process.env.PWD, global.dist, global.entry.svg, 'feather.svg'),
  'ext': '.svg',
  'prefix': 'feather-'
};