"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _ResolvedEndpointJs = require("./ResolvedEndpoint.js");

var _ResolvedEndpointJs2 = _interopRequireDefault(_ResolvedEndpointJs);

var _SimpleFactoryInjectorJs = require("../SimpleFactoryInjector.js");

var LoadedDataEndpoint = (function (_ResolvedEndpoint) {
  function LoadedDataEndpoint(Promise, resolvedEndpoint, resource) {
    var resourceTransformers = arguments[3] === undefined ? [] : arguments[3];
    var createResourceTransformers = arguments[4] === undefined ? [] : arguments[4];

    _classCallCheck(this, _LoadedDataEndpoint);

    _get(Object.getPrototypeOf(_LoadedDataEndpoint.prototype), "constructor", this).call(this, Promise, resolvedEndpoint.transport, resolvedEndpoint.templatedUrl, resolvedEndpoint.resourceTransformers.concat(resourceTransformers), resolvedEndpoint.createResourceTransformers.concat(createResourceTransformers));
    this.resource = resource;
    this.Promise = Promise;
    this.data = resolvedEndpoint._transformRequest(resolvedEndpoint.resourceTransformers, resource);
  }

  _inherits(LoadedDataEndpoint, _ResolvedEndpoint);

  var _LoadedDataEndpoint = LoadedDataEndpoint;

  _createClass(_LoadedDataEndpoint, [{
    key: "_load",
    value: function _load() {
      return this._transformResponse(this.resourceTransformers, this.Promise.resolve({
        data: this.data, etag: this.templatedUrl.etag }));
    }
  }, {
    key: "_update",
    value: function _update(resource) {
      var _this = this;

      var request = this._transformRequest(this.resourceTransformers, resource);
      var response = this.transport.put(this.templatedUrl.url, request);
      response = response.then(function (data) {
        _this.data = data.data;return data;
      });
      return this._transformResponse(this.resourceTransformers, response);
    }
  }]);

  LoadedDataEndpoint = (0, _SimpleFactoryInjectorJs.SimpleFactory)("LoadedDataEndpointFactory", ["RelayerPromise"])(LoadedDataEndpoint) || LoadedDataEndpoint;
  return LoadedDataEndpoint;
})(_ResolvedEndpointJs2["default"]);

exports["default"] = LoadedDataEndpoint;
module.exports = exports["default"];