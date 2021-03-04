const pkg = require('../package.json');

/**
 * Global configuration
 *
 * @type {Object}
 */
module.exports = {
  /**
   * Main project directories
   *
   * @type {String}
   */
  base: process.env.PWD,
  src: 'src',
  dist: (process.env.NODE_ENV === 'development')
    ? `dist/${pkg.cdn.content.development}` : 'dist' ,

  /**
   * Project entry-points. These are used by other files to determine defaults.
   * They must also have a reference in the directories configuration below.
   *
   * @type {Object}
   */
  entry: {
    styles: 'scss/style.scss',
    imports: 'scss/_imports.scss',
    config: 'config',
    scripts: 'js/main.js',
    name: 'MAIN',
    views: 'views',
    svg: 'svg'
  }
};