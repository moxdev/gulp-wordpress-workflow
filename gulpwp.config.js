/**
 * WPGulp Configuration File
 *
 * 1. Edit the variables as per your project requirements.
 * 2. In paths you can add <<glob or array of globs>>.
 *
 * @package
 */

module.exports.config = {
  projectURL: 'http://wpgulp.test/',

  sassSrc: './sass/**/*.scss',
  sassDest: './',

  jsSrc: './js/*.js',
  jsDest: './js/min/',

  jsVendorSrc: './js/vendor/**/*.js',
  jsVendorDest: './js/min/',

  phpSrc: './**/*.php',
  phpDest: './**/*.php',

  fontsSrc: './fonts/*.{tar,tar.bz2,tar.gz,zip}',
  fontsDest: './fonts/',
  fontsInclude: '**/*.{svg,ttf,otf,eot,woff,woff2}',
  fontsCSSInclude: '**/*.css',
  fontsSassFilename: '_fonts.scss',

  imgsSrc: './imgs/*',
  imgsDest: './imgs/',
};
