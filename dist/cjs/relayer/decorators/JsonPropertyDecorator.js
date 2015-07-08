"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _ResourceDecoratorJs = require("./ResourceDecorator.js");

var _ResourceDecoratorJs2 = _interopRequireDefault(_ResourceDecoratorJs);

var _SimpleFactoryInjectorJs = require("../SimpleFactoryInjector.js");

var JsonPropertyDecorator = (function (_ResourceDecorator) {
  function JsonPropertyDecorator(loadedDataEndpointFactory, embeddedPropertyTransformerFactory, promiseEndpointFactory, name, path, value, options) {
    _classCallCheck(this, _JsonPropertyDecorator);

    _get(Object.getPrototypeOf(_JsonPropertyDecorator.prototype), "constructor", this).call(this, name);

    this.path = path;
    this.options = options || {};
    this.loadedDataEndpointFactory = loadedDataEndpointFactory;
    this.embeddedPropertyTransformerFactory = embeddedPropertyTransformerFactory;
    this.promiseEndpointFactory = promiseEndpointFactory;
    this.value = value;
  }

  _inherits(JsonPropertyDecorator, _ResourceDecorator);

  var _JsonPropertyDecorator = JsonPropertyDecorator;

  _createClass(_JsonPropertyDecorator, [{
    key: "recordApply",
    value: function recordApply(target) {
      if (!target.hasOwnProperty(this.name)) {
        var afterSet = this.options.afterSet;
        var path = this.path;

        Object.defineProperty(target, this.name, {
          enumerable: true,
          configurable: true,
          get: function get() {
            return this.pathGet(path);
          },
          set: function set(value) {
            var result = this.pathSet(path, value);
            if (afterSet) {
              afterSet.call(this);
            }
            return result;
          }
        });
      }
    }
  }, {
    key: "resourceApply",
    value: function resourceApply(resource) {
      if (this.value !== undefined) {
        resource.setInitialValue(this.path, this.value);
      }
      this.recordApply(resource);
    }
  }, {
    key: "errorsApply",
    value: function errorsApply(errors) {
      this.recordApply(errors);
    }
  }, {
    key: "endpointFn",
    get: function () {

      if (!this._endpointFn) {

        var path = this.path;
        var promiseEndpointFactory = this.promiseEndpointFactory;
        var loadedDataEndpointFactory = this.loadedDataEndpointFactory;
        var embeddedPropertyTransformerFactory = this.embeddedPropertyTransformerFactory;
        this._endpointFn = function () {
          var uriParams = arguments[0] === undefined ? {} : arguments[0];

          // 'this' in here = Endpoint

          var newPromise = this.load().then(function (resource) {
            return loadedDataEndpointFactory(resource.self(), resource, [embeddedPropertyTransformerFactory(path)]);
          });

          var newEndpoint = promiseEndpointFactory(newPromise);

          return newEndpoint;
        };
      }

      return this._endpointFn;
    }
  }, {
    key: "endpointApply",
    value: function endpointApply(target) {
      this.addFunction(target, this.endpointFn);
    }
  }]);

  JsonPropertyDecorator = (0, _SimpleFactoryInjectorJs.SimpleFactory)("JsonPropertyDecoratorFactory", ["LoadedDataEndpointFactory", "EmbeddedPropertyTransformerFactory", "PromiseEndpointFactory"])(JsonPropertyDecorator) || JsonPropertyDecorator;
  return JsonPropertyDecorator;
})(_ResourceDecoratorJs2["default"]);

exports["default"] = JsonPropertyDecorator;
module.exports = exports["default"];

/*
export default class JsonPropertyTransform extends ResourceTransform {
  static get transformArguments() {
    return ["property", "jsonPath", "initial"]
  }

  transform(property, jsonPath, initial = undefined) {
    this.ResourceClass.prototype.defineJsonProperty(property, jsonPath);
    this.ResourceClass.prototype.addInitialValue(property, initial);
  }

  // WIP this would generate the promise version of calling this property, not tested
  static promiseCall(transformDescription) {
    return (results) => results[transformDescription.property];
  }
}
*/