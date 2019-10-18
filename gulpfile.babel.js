/**
 * Gulpfile.
 *
 * Gulp with WordPress.
 *
 * Implements:
 *      1. Live reloads browser with BrowserSync.
 *      2. CSS: Sass to CSS conversion, error catching, Autoprefixing, Sourcemaps,
 *         CSS minification, and Merge Media Queries.
 *      3. JS: Concatenates & uglifies Vendor and Custom JS files.
 *      4. Images: Minifies PNG, JPEG, GIF and SVG images.
 *      5. Watches files for changes in CSS or JS.
 *      6. Watches files for changes in PHP.
 *      7. Corrects the line endings.
 *      8. InjectCSS instead of browser page reload.
 *      9. Generates .pot file for i18n and l10n.
 *
 * @author Mox Biggs <https://twitter.com/moxbiggs/>
 */

import { config } from './gulpwp.config.js'; // URL of your local domain

import { src, dest, watch, series, parallel } from 'gulp';
// Importing all the Gulp-related packages we want to use
import autoprefixer from 'autoprefixer';
import babel from 'rollup-plugin-babel';
import beep from 'beepbeep';
import { create } from 'browser-sync';
import commonjs from 'rollup-plugin-commonjs';
import cssnano from 'cssnano';
import newer from 'gulp-newer';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import resolve from 'rollup-plugin-node-resolve';
import rollup from 'gulp-better-rollup';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'rollup-plugin-uglify';

const browserSync = create();

/**
 * Custom Error Handler.
 *
 * @param {string} error
 */
const errorHandler = ( error ) => {
  notify.onError( '\n\n❌  ===> ERROR: <%= error.message %>\n' )( error );
  beep();
};

/**
 * Task: `css`.
 * * Compiles sass to css, runs autoprefixer and minimizes css
 * * Copies css to ./
 * * Run with `gulp scripts`
 */
export function css() {
  return src( config.sassSrc, { allowEmpty: true } )
    .pipe( plumber( errorHandler ) ) // initialize plumber with error handling
    .pipe( sourcemaps.init() ) // initialize sourcemaps
    .pipe( sass().on( 'error', sass.logError ) ) // convert sass and compress
    .pipe( postcss( [ autoprefixer( { grid: true } ), cssnano() ] ) ) // run postcss autoprefixer, cssnano to minify
    .pipe( sourcemaps.write( '.' ) ) // write sourcemaps file in current directory
    .pipe( plumber.stop() )
    .pipe( dest( config.sassDest ) ) // put CSS and sourcemaps in dist/css folder
    .pipe( browserSync.stream() )
    .pipe( notify( { message: '✅ 👍 ✅  Completed Task: "css"', onLast: true } )
    );
}

/**
 * Task: `js`.
 * * Compiles JS: Create sourcemaps, transpile with Babel, rename file, minify output
 * * copies js files to dist/js/min
 * Run with `gulp js`
 */
export function js() {
  return src( config.jsSrc, { allowEmpty: true } )
    .pipe( newer( config.jsDest ) ) // only run on newer files
    .pipe( plumber( errorHandler ) ) // initialize plumber first
    .pipe( sourcemaps.init() ) // initialize sourcemaps
    .pipe( rollup( {
      plugins: [
        resolve(),
        commonjs(),
        babel(),
        uglify.uglify(), // minify js
      ],
    }, {
      format: 'iife',
    } ) )
    .pipe( rename( { suffix: '.min' } ) ) // rename file to use .min.js
    .pipe( sourcemaps.write( '.' ) ) // write sourcemaps file in current directory
    .pipe( plumber.stop() )
    .pipe( dest( config.jsDest ) ) // put js files and sourcemaps in dist/js folder
    .pipe( browserSync.stream() )
    .pipe( notify( { message: '✅ 👍 ✅   Completed Task: "js"', onLast: true } ) );
}

/**
 * Task: `jsVendor`.
 * * Compiles Vendor JS: Create sourcemaps, transpile with Babel, rename file, minify output
 * * copies js files to dist/js/min
 * Run with `gulp js`
 */
export function jsVendor() {
  return src( config.jsVendorSrc, { allowEmpty: true } )
    .pipe( newer( config.jsVendorDest ) ) // only run on newer files
    .pipe( plumber( errorHandler ) ) // initialize plumber first
    .pipe( sourcemaps.init() ) // initialize sourcemaps
    .pipe( rollup( {
      plugins: [
        resolve(),
        commonjs(),
        babel(),
        uglify.uglify(), // minify js
      ],
    }, {
      format: 'iife',
    } ) )
    .pipe( rename( { suffix: '.min' } ) ) // rename file to use .min.js
    .pipe( sourcemaps.write( '.' ) ) // write sourcemaps file in current directory
    .pipe( plumber.stop() )
    .pipe( dest( config.jsVendorDest ) ) // put js files and sourcemaps in dist/js folder
    .pipe( browserSync.stream() )
    .pipe( notify( { message: '✅ 👍 ✅   Completed Task: "jsVendor"', onLast: true } ) );
}

/**
 * Task: `watchFiles`.
 * * watches for changes
 * * runs coresponding functions if changes
 * * reloads BrowserSync
 * * run with `gulp watchFiles`
 */
export function watchFiles() {
  watch( config.sassSrc, series( css, reload ) );
  watch( config.jsSrc, series( js, reload ) );
  watch( config.jsVendorSrc, series( jsVendor, reload ) );
  // watch( fontsPaths.src, series( fonts, reload ) );
}

/**
 * Task: `server`.
 * Uses Browsersync for live Reloads, CSS injections, Localhost tunneling.
 * {@link http://www.browsersync.io/docs/options/}
 * Uses `browser-sync-reuse-tab` to always open in same browser tab
 * {@link https://www.npmjs.com/package/browser-sync-reuse-tab}
 * Run with `gulp server`
 *
 * @callback requestCallback
 * @param {requestCallback} done - The response when finished
 */
export function server( done ) {
  browserSync.init( {
    proxy: config.projectURL,
    port: 3000,
    injectChanges: true,
  } );
  done();
  watchFiles();
}

/**
 * Task: `reload`.
 * Helper function to reloads BrowserSync server
 * Used in watchFiles function
 * Run with `gulp reload`
 *
 * @callback requestCallback
 * @param {requestCallback} done - The response when finished
 */
export function reload( done ) {
  browserSync.reload();
  done();
}

/**
 * ! Gulp default:
 * * starts BrowserSync server
 * * watches files for changes and reloads browser if changes
 * * run with `gulp`
 */
exports.default = series(
  parallel( css, js, jsVendor ),
  server
);

// /**
//  * ! Fonts function:
//  * * copies font files to dist/fonts/
//  * * run with `gulp fonts`
//  */
// export function fonts() {
//   return src( fontsPaths.src, { allowEmpty: true } )
//     .pipe( dest( fontsPaths.dest ) )
//     .pipe( browserSync.stream() )
//     .pipe( notify( { message: 'TASK: "fonts" completed', onLast: true } )
//     );
// }
