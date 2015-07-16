var gulp = require('gulp');
var connect = require('gulp-connect');
var rename_ = require('gulp-rename');
var bump = require('gulp-bump');
var gulp = require('gulp');
var karma = require('karma').server;
var xingTraceurTask = require('xing-traceur').rawTask;

var TRACEUR_OPTIONS = require('./config').traceur;
var PATH = {
  DIST: './dist/',
  BUILD: './build/',
  SRC: './src/**/*.js',
  TEST: './test/**/*.js'
};

gulp.task('testPrep', function(done) {
  var files = [{
    dest: PATH.BUILD + "test-main.js",
    src: [PATH.TEST]
  }]
  var options = {
    sourceMaps: true,
    traceurOptions: TRACEUR_OPTIONS,
    moduleMaps: require('./moduleMaps')
  }
  xingTraceurTask(options, files, function(result) {
    done(!result);
  });
});

/**
 * Run test once and exit
 */
gulp.task('test', ['testPrep'], function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});


/**
 * Run test once and exit, firefox browser
 */
gulp.task('test:firefox', ['testPrep'], function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    browsers: ["Firefox"],
    singleRun: true
  }, done);
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', ['testPrep'], function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
  }, done);
  gulp.watch(PATH.TEST, ['testPrep']);
  gulp.watch(PATH.SRC, ['testPrep']);
});

// A wrapper around gulp-rename to support `dirnamePrefix`.
function rename(obj) {
  return rename_(function(parsedPath) {
    return {
      extname: obj.extname || parsedPath.extname,
      dirname: (obj.dirnamePrefix || '') + parsedPath.dirname,
      basename: parsedPath.basename
    };
  });
}

gulp.task('dist', function() {
  gulp.src(PATH.SRC, {base: './src'})
      .pipe(rename({extname: '.js', dirnamePrefix: PATH.DIST}))
      .pipe(gulp.dest('.'));
});

// Basic usage:
// Will patch the version
gulp.task('bump:patch', function(){
  gulp.src(['./bower.json', './package.json'])
  .pipe(bump())
  .pipe(gulp.dest('./'));
});

// Defined method of updating:
// Semantic
gulp.task('bump:minor', function(){
  gulp.src(['./bower.json', './package.json'])
  .pipe(bump({type:'minor'}))
  .pipe(gulp.dest('./'));
});

// Defined method of updating:
// Semantic major
gulp.task('bump:major', function(){
  gulp.src(['./bower.json', './package.json'])
  .pipe(bump({type:'major'}))
  .pipe(gulp.dest('./'));
});

gulp.task('default', ['tdd']);
