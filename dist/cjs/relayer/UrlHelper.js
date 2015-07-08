'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _SimpleFactoryInjectorJs = require('./SimpleFactoryInjector.js');

var UrlHelper = (function () {
  function UrlHelper(baseUrl) {
    _classCallCheck(this, _UrlHelper);

    if (this.isFullUrl(baseUrl)) {
      baseUrl = this.fullUrlRegEx.exec(baseUrl)[1];
    }
    this.baseUrl = this.withoutTrailingSlash(baseUrl);
  }

  var _UrlHelper = UrlHelper;

  _createClass(_UrlHelper, [{
    key: 'mangleUrl',
    value: function mangleUrl(url) {
      if (url) {
        return url.replace(/^\//, '');
      }
    }
  }, {
    key: 'fullUrl',
    value: function fullUrl(url) {
      if (this.isFullUrl(url)) {
        return url;
      } else {
        return '' + this.baseUrl + '/' + this.mangleUrl(url);
      }
    }
  }, {
    key: 'fullUrlRegEx',
    get: function () {
      return new RegExp('(([A-Za-z]+:)?//[^/]+)(/.*)');
    }
  }, {
    key: 'isFullUrl',
    value: function isFullUrl(url) {
      return this.fullUrlRegEx.test(url);
    }
  }, {
    key: 'withoutTrailingSlash',
    value: function withoutTrailingSlash(url) {
      if (url) {
        return /\/$/.test(url) ? url.substring(0, url.length - 1) : url;
      }
    }
  }, {
    key: 'checkLocationUrl',
    value: function checkLocationUrl(respUrl, reqUrl) {
      if (this.isFullUrl(respUrl)) {
        return respUrl;
      } else {
        return this.fullUrlRegEx.exec(reqUrl)[1] + respUrl;
      }
    }
  }]);

  UrlHelper = (0, _SimpleFactoryInjectorJs.SimpleFactory)('UrlHelperFactory', [])(UrlHelper) || UrlHelper;
  return UrlHelper;
})();

exports['default'] = UrlHelper;
module.exports = exports['default'];