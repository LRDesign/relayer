'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _SimpleFactoryInjectorJs = require('./SimpleFactoryInjector.js');

var TemplatedUrl = (function () {
  function TemplatedUrl(uriTemplate) {
    var uriParams = arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, _TemplatedUrl);

    this._uriTemplate = new UriTemplate(uriTemplate);
    this._uriParams = uriParams;
    this._paths = [];
    this._url = this._uriTemplate.fillFromObject(this._uriParams);
  }

  var _TemplatedUrl = TemplatedUrl;

  _createClass(_TemplatedUrl, [{
    key: 'uriTemplate',
    get: function () {
      return this._uriTemplate.toString();
    }
  }, {
    key: 'uriParams',
    get: function () {
      return this._uriParams;
    }
  }, {
    key: 'url',
    get: function () {
      return this._url;
    }
  }, {
    key: '_setUrl',
    value: function _setUrl(url) {
      var uriParams = this._uriTemplate.fromUri(url);
      this._uriParams = uriParams;
      this._url = url;
    }
  }, {
    key: 'addDataPathLink',
    value: function addDataPathLink(resource, path) {
      var overwrite = arguments[2] === undefined ? true : arguments[2];

      if (overwrite) {
        var newUrl = resource.pathGet(path);
        if (newUrl) {
          this._setUrl(newUrl);
          this._paths.forEach(function (path) {
            path.resource.pathSet(path.path, newUrl);
          });
        }
      } else {
        resource.pathSet(path, this.url);
      }
      this._paths.push({
        resource: resource,
        path: path
      });
    }
  }, {
    key: 'removeDataPathLink',
    value: function removeDataPathLink(resource, path) {
      this._paths = this._paths.filter(function (pathLink) {
        return pathLink.resource != resource || pathLink.path != path;
      });
    }
  }]);

  TemplatedUrl = (0, _SimpleFactoryInjectorJs.SimpleFactory)('TemplatedUrlFactory')(TemplatedUrl) || TemplatedUrl;
  return TemplatedUrl;
})();

exports.TemplatedUrl = TemplatedUrl;

var TemplatedUrlFromUrl = (function (_TemplatedUrl2) {
  function TemplatedUrlFromUrl(uriTemplate, url) {
    _classCallCheck(this, _TemplatedUrlFromUrl);

    _get(Object.getPrototypeOf(_TemplatedUrlFromUrl.prototype), 'constructor', this).call(this, uriTemplate);
    _get(Object.getPrototypeOf(_TemplatedUrlFromUrl.prototype), '_setUrl', this).call(this, url);
  }

  _inherits(TemplatedUrlFromUrl, _TemplatedUrl2);

  var _TemplatedUrlFromUrl = TemplatedUrlFromUrl;
  TemplatedUrlFromUrl = (0, _SimpleFactoryInjectorJs.SimpleFactory)('TemplatedUrlFromUrlFactory')(TemplatedUrlFromUrl) || TemplatedUrlFromUrl;
  return TemplatedUrlFromUrl;
})(TemplatedUrl);

exports.TemplatedUrlFromUrl = TemplatedUrlFromUrl;