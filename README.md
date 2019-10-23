# Gulp WordPress Theme Workflow

![Version 1.0.0](https://img.shields.io/badge/Version-1.0.0-brightgreen.svg)
![Gulp 4.0.2](https://img.shields.io/badge/gulp-4.0.2-red)

Gulp workflow for WP theme development using [_s](http://underscores.me/).

**IMPORTANT: This workflow has been updated to use Gulp 4. You will need to install the Gulp CLI before using:**

`npm install gulp-cli -g`

## Features:

1. Uses ES6 imports with Babel configurations
2. Browser refreshing using BrowserSync
3. Sass compilation, mapping, auto-prefixing
4. Javascript transpiling with Babel, minification, mapping
5. JS linting with ES Lint through VSCode.

## Installation:

1. Download your copy of _s and install in the "/wp-content/themes/" directory
2. Add the files in this respository to the theme folder (you can omit README.md)
3. Run npm install
4. Set the URL of your local environment in the "projectURL" variable at the top of [gulpwp.config.js](gulpwp.config.js)
5. Run the default task (gulp) to get started