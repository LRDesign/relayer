var gulp = require('gulp');
var traceur = require('gulp-traceur');
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
    includeRuntime: true,
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
  gulp.src(PATH.SRC, {base: '.'})
      // Rename before Traceur, so that Traceur has the knowledge of both input and output paths.
      .pipe(rename({extname: '.js', dirnamePrefix: PATH.DIST}))
      .pipe(gulp.dest('.'));
});

// TRANSPILE AT SCRIPT
gulp.task('build/src', function() {
  gulp.src(PATH.SRC, {base: '.'})
      // Rename before Traceur, so that Traceur has the knowledge of both input and output paths.
      .pipe(rename({extname: '.js', dirnamePrefix: PATH.BUILD}))
      .pipe(traceur(TRACEUR_OPTIONS))
      .pipe(gulp.dest('.'));
});

gulp.task('build/test', function() {
  gulp.src(PATH.TEST, {base: '.'})
      // Rename before Traceur, so that Traceur has the knowledge of both input and output paths.
      .pipe(rename({extname: '.js', dirnamePrefix: PATH.BUILD}))
      .pipe(traceur(TRACEUR_OPTIONS))
      .pipe(gulp.dest('.'));
});

gulp.task('dist', function() {
  gulp.src(PATH.SRC, {base: './src'})
      // Rename before Traceur, so that Traceur has the knowledge of both input and output paths.
      .pipe(rename({extname: '.js', dirnamePrefix: PATH.DIST}))
      .pipe(gulp.dest('.'));
});

gulp.task('build', ['build/src', 'build/test']);

// WATCH FILES FOR CHANGES
gulp.task('watch', function() {
  gulp.watch(PATH.SRC, ['build']);
});


// WEB SERVER
gulp.task('serve', function() {
  connect.server({
    root: [__dirname],
    port: 8000,
    livereload: false
  });
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

gulp.task('default', ['serve', 'watch']);
