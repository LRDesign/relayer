// Karma configuration
// Generated on Fri Mar 14 2014 15:01:19 GMT-0700 (PDT)

var traceurOptions = require('./config').traceur;

module.exports = function(config) {

  config.set({
    frameworks: ['jasmine'],

    files: [
      'node_modules/angular/angular.js',
      'node_modules/uri-templates/uri-templates.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'build/test-main.js'
    ],

    preprocessors: {
      '**/*.js': ['sourcemap']
    },

    browsers: ['Chrome'],

  });
};
