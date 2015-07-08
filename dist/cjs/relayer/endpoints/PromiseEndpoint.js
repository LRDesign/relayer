"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _EndpointJs = require("./Endpoint.js");

var _EndpointJs2 = _interopRequireDefault(_EndpointJs);

var _SimpleFactoryInjectorJs = require("../SimpleFactoryInjector.js");

var PromiseEndpoint = (function (_Endpoint) {
  function PromiseEndpoint(promise) {
    _classCallCheck(this, _PromiseEndpoint);

    _get(Object.getPrototypeOf(_PromiseEndpoint.prototype), "constructor", this).call(this);
    this.endpointPromise = promise;
  }

  _inherits(PromiseEndpoint, _Endpoint);

  var _PromiseEndpoint = PromiseEndpoint;
  PromiseEndpoint = (0, _SimpleFactoryInjectorJs.SimpleFactory)("PromiseEndpointFactory")(PromiseEndpoint) || PromiseEndpoint;
  return PromiseEndpoint;
})(_EndpointJs2["default"]);

exports["default"] = PromiseEndpoint;
module.exports = exports["default"];