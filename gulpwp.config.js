/**
 * Gulp Configuration File
 *
 * * 1. Edit the variables as per your project requirements.
 * * 2. In paths you can add <<glob or array of globs>>.
 */

module.exports.config = {
  projectURL: 'your url here',

  sassSrc: './sass/**/*.scss',
  sassDest: './',

  jsSrc: './js/*.js',
  jsDest: './js/min/',

  jsVendorSrc: './js/vendor/**/*.js',
  jsVendorDest: './js/min/',

  phpSrc: './**/*.php',

  fontsSrc: './fonts/*.{tar,tar.bz2,tar.gz,zip}',
  fontsDest: './fonts/',
  fontsInclude: '**/*.{svg,ttf,otf,eot,woff,woff2}',

  fontsCSSDest: './fonts/css',
  fontsCSSInclude: '*.css',
  fontsCSSFilename: 'typography.css',

  fontsSassSrc: [ './fonts/css/typography.css', './sass/variables-site/_typography.scss' ],
  fontsSassDest: './sass/variables-site/',
  fontsSassFileName: '_typography.scss',

  imgsSrc: './imgs/*',
};
