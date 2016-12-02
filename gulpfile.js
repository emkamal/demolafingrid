/*eslint-disable */
var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');

var bower = require('bower-files');
var rollup = require('rollup');
var babel = require('rollup-plugin-babel');

var browserSync = require('browser-sync');

var compressJs = require('gulp-uglify');
var compressCss = require('gulp-cssnano');
var rimraf = require('gulp-rimraf');

var concat = require('gulp-concat');
var replace = require('gulp-replace');

var reload = browserSync.reload;

// Browser
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: "./build/"
    },
    files: ['./build/**/*.*'],
    browser: 'chrome',
    port: 5000,
  });
});

// Watch
gulp.task('watch', function() {
  gulp.watch('src/js/**/*.js', ['build:js:main']);
  gulp.watch('src/css/**/*.css', ['build:css']);
  gulp.watch('src/*.html', ['build:html:dev']);
  gulp.watch('src/datasets/*', ['move:datasets']);
  gulp.watch('src/fonts/*', ['move:fonts']);
});

function build_js(src,dest){
  return rollup.rollup({
    entry: src,
    plugins: [
 		 babel({ runtimeHelpers: true })
 	 ]
  }).then( function ( bundle ) {
    bundle.write({
      format: 'iife',
      sourceMap: true,
      dest: dest
    });
    browserSync.reload();
  });
}

// Javascript code
gulp.task('build:js:index', function() {
  return build_js('./src/js/index.js', './build/js/index.js');
});
gulp.task('build:js:piechart', function() {
  return build_js('./src/js/piechart.js', './build/js/piechart.js');
});
gulp.task('build:js:powerbalance', function() {
  return build_js('./src/js/powerbalance.js', './build/js/powerbalance.js');
});
gulp.task('build:js:flowmap', function() {
  return build_js('./src/js/flowmap.js', './build/js/flowmap.js');
});

// Javascript VENDOR
gulp.task('build:js:vendor', () => {
  const lib = bower();
  return gulp.src(lib.ext('js').files)
    .pipe(concat('vendor.js'))
    .pipe(compressJs())
    .pipe(gulp.dest('build/js'));
});

// COMPRESSION
gulp.task('compress:js', ['clean:map'], function() {
  return gulp.src('build/js/*.js')
    // TODO: fix this problem with uglifyJS, it seems to be caused by some config problem with babel
    // .pipe(compressJs().on('error', function(e){
    //   console.log(e);
    // }))
    .pipe(gulp.dest('./build/js'));
});

gulp.task('compress:css', function() {
  return gulp.src('build/css/*.css')
    .pipe(compressCss())
    .pipe(gulp.dest('./build/css'));
});

// HTML
var envReplace = function (env) {
  return gulp.src(['src/*.html'])
    .pipe(replace('__REPLACE_ENV__', env))
    .pipe(gulp.dest('./build'));
}

gulp.task('build:html:dev', function() {
  return envReplace('development');
});

gulp.task('build:html:dist', function() {
  return envReplace('production');
});

// CSS
gulp.task('build:css', function() {
  return gulp.src('./src/css/*.css')
  .pipe(gulp.dest('build/css'))
  .pipe(reload({stream:true}));
});

// Datasets
gulp.task('move:datasets', function() {
  return gulp.src('./src/datasets/*')
  .pipe(gulp.dest('build/datasets'))
  .pipe(reload({stream:true}));
});

// Fonts
gulp.task('move:fonts', function() {
  return gulp.src('./src/fonts/*')
  .pipe(gulp.dest('./build/fonts'))
  .pipe(reload({stream:true}));
});

// Clean
gulp.task('clean', function() {
   return gulp.src('./build/*', { read: false })
		.pipe(rimraf({ force: true }));
});

gulp.task('clean:map', function () {
  return gulp.src('./build/js/*.js.map', { read: false })
    .pipe(rimraf({ force: true }));
});

gulp.task('move', ['move:datasets', 'move:fonts']);
gulp.task('build:js:main', ['build:js:index', 'build:js:piechart', 'build:js:powerbalance', 'build:js:flowmap'])
gulp.task('build:assets', ['build:js:main', 'build:js:vendor', 'build:css', 'move']);
gulp.task('compress', ['compress:js', 'compress:css']);

gulp.task('default', gulpSequence('clean', ['build:html:dev', 'build:assets'], 'browser-sync', 'watch'));
gulp.task('dist', gulpSequence('clean', ['build:html:dist', 'build:assets'], 'compress'));
