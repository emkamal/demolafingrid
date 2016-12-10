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

## Coding Workflow
This is how we should do the coding on this project:
1. before starting any coding, first do git pull if there is new commit on the master repo
2. and then type 'gulp' in the shell to activate the server
3. start your coding, this coding should ONLY be in the src folder
4. any change you saved in the src folder will automatically recognised by nodejs server and with the help of BrowserSync (a module of nodeJS) it will immediately refresh the opened page  on every connected browser (in this case chrome and firefox), you can see the result of your coding immediately
