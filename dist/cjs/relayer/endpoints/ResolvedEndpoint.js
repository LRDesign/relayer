"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _EndpointJs = require("./Endpoint.js");

var _EndpointJs2 = _interopRequireDefault(_EndpointJs);

var _SimpleFactoryInjectorJs = require("../SimpleFactoryInjector.js");

var ResolvedEndpoint = (function (_Endpoint) {
  function ResolvedEndpoint(Promise, transport, templatedUrl) {
    var resourceTransformers = arguments[3] === undefined ? [] : arguments[3];
    var createResourceTransformers = arguments[4] === undefined ? [] : arguments[4];

    _classCallCheck(this, _ResolvedEndpoint);

    _get(Object.getPrototypeOf(_ResolvedEndpoint.prototype), "constructor", this).call(this);
    this.transport = transport;
    this.templatedUrl = templatedUrl;
    if (Array.isArray(resourceTransformers)) {
      this.resourceTransformers = resourceTransformers;
    } else {
      this.resourceTransformers = [resourceTransformers];
    }
    if (Array.isArray(createResourceTransformers)) {
      this.createResourceTransformers = createResourceTransformers;
    } else {
      this.createResourceTransformers = [createResourceTransformers];
    }
    this.endpointPromise = Promise.resolve(this);
  }

  _inherits(ResolvedEndpoint, _Endpoint);

  var _ResolvedEndpoint = ResolvedEndpoint;

  _createClass(_ResolvedEndpoint, [{
    key: "_load",
    value: function _load() {
      var response = this.transport.get(this.templatedUrl.url, this.templatedUrl.etag);
      return this._transformResponse(this.resourceTransformers, response);
    }
  }, {
    key: "_update",
    value: function _update(resource) {
      var request = this._transformRequest(this.resourceTransformers, resource);
      var response = this.transport.put(this.templatedUrl.url, request, this.templatedUrl.etag);
      return this._transformResponse(this.resourceTransformers, response);
    }
  }, {
    key: "_create",
    value: function _create(resource) {
      var request = this._transformRequest(this.createResourceTransformers, resource);
      var response = this.transport.post(this.templatedUrl.url, request);
      return this._transformResponse(this.createResourceTransformers, response);
    }
  }, {
    key: "_transformResponse",
    value: function _transformResponse(transformers, response) {
      var _this = this;

      return transformers.reduce(function (interimResponse, transformer) {
        return transformer.transformResponse(_this, interimResponse);
      }, response);
    }
  }, {
    key: "_transformRequest",
    value: function _transformRequest(transformers, request) {
      var _this2 = this;

      return transformers.slice(0).reverse().reduce(function (interimRequest, transformer) {

        return transformer.transformRequest(_this2, interimRequest);
      }, request);
    }
  }, {
    key: "_remove",
    value: function _remove() {
      return this.transport.remove(this.templatedUrl.url);
    }
  }]);

  ResolvedEndpoint = (0, _SimpleFactoryInjectorJs.SimpleFactory)("ResolvedEndpointFactory", ["RelayerPromise"])(ResolvedEndpoint) || ResolvedEndpoint;
  return ResolvedEndpoint;
})(_EndpointJs2["default"]);

exports["default"] = ResolvedEndpoint;
module.exports = exports["default"];