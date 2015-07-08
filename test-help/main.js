// The entry point for unit tests.

console.log("loaded");

var TEST_REGEXP = /test\/.*\.js$/;

function pathToModule(path) {
  return path.replace(/^\/base\//, '').replace(/\.js$/, '');
}

function onlySpecs(path) {
  return TEST_REGEXP.test(path);
}

function getAllSpecs() {
  return Object.keys(window.__karma__.files)
      .filter(onlySpecs)
      .map(pathToModule);
}

require.config({
  // Karma serves files under `/base`, which is the `basePath` from `karma-conf.js` file.
  baseUrl: '/base',

  paths: {
    assert: './node_modules/rtts-assert/dist/amd/assert',
    angular: './bower_components/angular/angular',
    'uri-templates': './node_modules/uri-templates/uri-templates',
    'angular-mocks': './bower_components/angular-mocks/angular-mocks',
    'angular-new-router': './node_modules/angular-new-router/dist/router.es5',
    'a1atscript': './build/node_modules/a1atscript/dist/a1atscript',
    'xing-inflector': './build/node_modules/xing-inflector/dist/xing-inflector'
  },

  shim: {
    'angular': {'exports': 'angular'},
    'angular-mocks': {deps: ['angular'], 'exports': 'angular.mock'},
    'angular-new-router': {deps: ['angular']}
  },

  // Dynamically load all test files.
  deps: getAllSpecs(),

  // Kickoff Jasmine, once all spec files are loaded.
  callback: window.__karma__.start
});
