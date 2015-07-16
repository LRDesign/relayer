// Karma configuration
// Generated on Fri Mar 14 2014 15:01:19 GMT-0700 (PDT)

var babelOptions = require('./config').babel;

module.exports = function(config) {

  config.set({
    frameworks: ['jasmine', 'browserify'],

    files: [
      'node_modules/karma-babel-preprocessor/node_modules/babel-core/browser-polyfill.js',
      'node_modules/angular/angular.js',
      'node_modules/uri-templates/uri-templates.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'test/**/*.js'
      // The entry point that dynamically imports all the specs.
      //{pattern: 'test-help/main.js', included: true},

      // The runtime assertion library.
      //'node_modules/rtts-assert/dist/cjs/assert.js',
      //'node_modules/angular/angular.js',
      //'node_modules/angular-mocks/angular-mocks.js'
    ],

    preprocessors: {
      'test/**/*.js': ['browserify'],
    },

    browsers: ['Chrome'],

    browserify: {
      debug: true,
      sourceMaps: true,
      transform: [ ['babelify', babelOptions] ]
    }

  });

};
