/**
 * WPGulp Configuration File
 *
 * 1. Edit the variables as per your project requirements.
 * 2. In paths you can add <<glob or array of globs>>.
 *
 * @package
 */

module.exports.config = {
  projectURL: 'http://expedite-delivery-system.test/',

  sassSrc: '/sass/**/*.scss',
  sassDest: './',

  jsSrc: '/js/*.js',
  jsDest: '/js/min/',

  phpSrc: '/**/*.php',
  phpDest: '/**/*.php',

  fonstSrc: '/fonts/*',
  fonstDest: '/fonts/',

  imgsSrc: '/imgs/*',
  imgsDest: '/imgs/',
};
