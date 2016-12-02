[![Dependency Status](https://david-dm.org/Packet-Clearing-House/d3-es6-boilerplate.svg)](https://david-dm.org/Packet-Clearing-House/d3-es6-boilerplate) [![devDependency Status](https://david-dm.org/Packet-Clearing-House/d3-es6-boilerplate/dev-status.svg)](https://david-dm.org/Packet-Clearing-House/d3-es6-boilerplate#info=devDependencies)

# Demola Fingrid Project

The goal of this project is to build visualization for electricity market using data set from Fingrid. It will be done using D3 library with Javascript ES6.

## Boilerplate
The project uses [D3 boilerplate](https://github.com/emkamal/d3-es6-boilerplate) with several features as listed below:
- Automates building and actions using [Gulp](http://gulpjs.com/)
- Manages Browser Javascript using [Bower](http://bower.io/)
- Transpiles ES6+ automagically using [Babel](https://babeljs.io/) and uses sourcemap to better debug code.
- Local dev server with [BrowserSync](http://browsersync.io/)
- Compress assets for production with Uglify
- Lints your code using ESLint (Airbnb code style)
- Get environment _development_ or _production_ with the JS variable `ENV`
- Use Bower to get vendors Javascript libraries and combine them (here D3)

## Requirements

- [NodeJs](http://www.nodejs.org), type `npm -v` on your terminal to check if you have it.
- Gulp `npm install -g gulp`
- Bower `npm install -g bower`

## Getting Started

1. Run `npm install` to install dependencies
2. Run `bower install` to download Browser Javacript libraries
3. Run `gulp` to start the local dev environment on `http://localhost:5000`
4. To have production ready files, run: `gulp dist`. All built files are located in the folder `/build/`
5. Let's code!
