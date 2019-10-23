'use-strict';
/* eslint no-console: 0 */

/**
 * Gulpfile.
 * * setup your configurations in "gulpwp.config.js"
 *
 * Gulp with WordPress.
 *
 * Implements:
 * * 1. Live reloads browser with BrowserSync (InjectCSS instead of browser page reload).
 * * 2. CSS: Sass to CSS conversion, error catching, Autoprefixing, Sourcemaps, CSS minification
 * * 3. JS: Concatenates & uglifies Vendor and Custom JS files.
 * * 4. Watches files for changes in CSS, JS, PHP, IMGS.
 *
 * @author Shane Biggs <https://twitter.com/moxbiggs/>
 */

import { config } from './gulpwp.config.js'; // set your URL and file paths here

import { src, dest, watch, series, parallel } from 'gulp';
import autoprefixer from 'autoprefixer';
import babel from 'rollup-plugin-babel';
import beep from 'beepbeep';
import { create } from 'browser-sync';
import commonjs from 'rollup-plugin-commonjs';
import concat from 'gulp-concat';
import cssnano from 'cssnano';
import del from 'del';
import fs from 'fs';
import minimatch from 'minimatch';
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
import unzip from 'gulp-unzip';

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
 * Task: `server`.
 * * uses Browsersync for live Reloads, CSS injections, Localhost tunneling.
 * { @link http://www.browsersync.io/docs/options/ }
 *
 * @callback requestCallback
 * @param {requestCallback} done - The response when finished
 *
 * run with `gulp server`
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
 * * helper function to reload BrowserSync server
 * * used in watchFiles function
 *
 * * run with `gulp reload`
 *
 * @callback requestCallback
 * @param {requestCallback} done - The response when finished
 */

export function reload( done ) {
  browserSync.reload();
  done();
}

/**
 * Task: `watchFiles`.
 * * watches for changes to php, sass, js, imgs
 * * runs coresponding functions if changes
 * * reloads BrowserSync
 *
 * * run with `gulp watchFiles`
 */

export function watchFiles() {
  watch( config.phpSrc, reload );
  watch( config.imgsSrc, reload );
  watch( config.sassSrc, series( css, reload ) );
  watch( config.jsSrc, series( js, reload ) );
  watch( config.jsVendorSrc, series( jsVendor, reload ) );
}

/**
 * Task: `css`.
 * * compiles sass to css, runs autoprefixer and minimizes css
 * * copies css to ./style.css with sourcemap
 *
 * * run with `gulp css`
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
    .pipe( notify( { message: '✅ 👍 ✅  Completed Task: "css"', onLast: true } ) );
}

/**
 * Task: `js`.
 * * compiles JS: create sourcemaps, transpile with Babel, rename file, minify output
 * * copies js files to ./js/min with sourcemap
 *
 * * run with `gulp js`
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
 * * compiles Vendor JS: create sourcemaps, transpile with Babel, rename file, minify output
 * * copies js files to ./js/min with sourcemap
 *
 * * run with `gulp jsVendor`
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
 * ! OPTIONAL FUNCTIONS
 * * MUST RUN THESE FUNCTIONS MANUALLY
 * *  `gulp build` and `gulp fonts`
 */

/**
 * Task: `unzipFonts`.
 * * unzips webfonts into ./fonts
 */

function unzipFonts() {
  return src( config.fontsSrc, { allowEmpty: true } )
    .pipe( unzip( {
      filter( entry ) {
        return minimatch( entry.path, config.fontsInclude );
      },
    } ) )
    .pipe( dest( config.fontsDest ) )
    .pipe( browserSync.stream() )
    .pipe( notify( { message: '✅ 👍 ✅   Completed Task: "unzipFonts"', onLast: true } ) );
}

/**
 * Task: `createFontsCSS`.
 * * extracts and creates the fonts css
 */

function createFontsCSS() {
  return src( config.fontsSrc, { allowEmpty: true } )
    .pipe( unzip( {
      filter( entry ) {
        return minimatch( entry.path, config.fontsCSSInclude );
      },
    } ) )
    .pipe( concat( config.fontsCSSFilename ) )
    .pipe( dest( config.fontsCSSDest ) )
    .pipe( browserSync.stream() )
    .pipe( notify( { message: '✅ 👍 ✅   Completed Task: "createFontsCSS"', onLast: true } ) );
}

/**
 * Task: `addFontsCSSToSass`.
 * * adds fonts css to "sass/variables-site/_typography.scss"
 */

function addFontsCSSToSass() {
  return src( config.fontsSassSrc, { allowEmpty: true } )
    .pipe( concat( '_typography.scss' ) )
    .pipe( dest( config.fontsSassDest ) )
    .pipe( browserSync.stream() )
    .pipe( notify( { message: '✅ 👍 ✅   Completed Task: "addFontsCSSToSass"', onLast: true } ) );
}

/**
 * Task: `cleanFonts`.
 * * deletes unecessary leftover files
 */

function cleanFonts() {
  return ( del( [ config.fontsCSSDest, config.fontsSrc ] ) );
}

/**
 * Task: `deletePHPCS`.
 * * deletes the _underscores "phpcs.xml.dist" file
 */

function deletePHPCS() {
  return ( del( [ './phpcs.xml.dist' ] ) );
}

/**
 * Task: `makeFolders`.
 * * creates the ./fonts and ./imgs file structure
 * * add desired folders to the folders array
 *
 * @callback requestCallback
 * @param {requestCallback} done - The response when finished
 */

function makeFolders( done ) {
  const folders = [
    'imgs',
    'fonts',
    'js/vendor',
  ];

  folders.forEach( ( dir ) => {
    if ( ! fs.existsSync( dir ) ) {
      fs.mkdirSync( dir );
      console.log( { message: '📁  folder created:' + dir, onLast: true } );
    }
  } );
  done();
}

/**
 * ! Gulp default:
 * * starts BrowserSync server
 * * watches files for changes and reloads browser if changes
 *
 * * run with `gulp`
 */

exports.default = series( parallel( css, js, jsVendor ), server );

/**
 * Task: `build`.
 * * deletes "phpcs.xml.dist" file
 * * creates declared folders
 *
 * * run with `gulp build`
 */

exports.build = series( deletePHPCS, makeFolders );

/**
 * Task: `fonts`.
 * * unzips fonts
 * * extracts the css and adds it to "sass/variables-site/_typography.scss"
 * * deletes uncessary files
 *
 * * run with `gulp fonts`
 */

exports.fonts = series( unzipFonts, createFontsCSS, addFontsCSSToSass, cleanFonts );
