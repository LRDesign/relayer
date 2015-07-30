"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _ResourceDecoratorJs = require("./ResourceDecorator.js");

var _ResourceDecoratorJs2 = _interopRequireDefault(_ResourceDecoratorJs);

var _TemplatedUrlJs = require("../TemplatedUrl.js");

var _SimpleFactoryInjectorJs = require("../SimpleFactoryInjector.js");

var RelatedResourceDecorator = (function (_ResourceDecorator) {
  function RelatedResourceDecorator(promiseEndpointFactory, relationshipUtilities, name, relationship) {
    _classCallCheck(this, _RelatedResourceDecorator);

    _get(Object.getPrototypeOf(_RelatedResourceDecorator.prototype), "constructor", this).call(this, name);

    this.promiseEndpointFactory = promiseEndpointFactory;
    this.relationshipUtilities = relationshipUtilities;
    this.relationship = relationship;
  }

  _inherits(RelatedResourceDecorator, _ResourceDecorator);

  var _RelatedResourceDecorator = RelatedResourceDecorator;

  _createClass(_RelatedResourceDecorator, [{
    key: "resourceFn",
    get: function () {
      if (!this._resourceFn) {
        var name = this.name;
        var relationship = this.relationship;
        var promiseEndpointFactory = this.promiseEndpointFactory;
        var relationshipUtilities = this.relationshipUtilities;
        this._resourceFn = function (uriParams) {
          var recursiveCall = arguments[1] === undefined ? false : arguments[1];

          if (relationship.async && this.isPersisted) {
            var endpoint;
            if (!this.relationships[name]) {
              if (recursiveCall == false) {
                endpoint = promiseEndpointFactory(this.self().load().then(function (resource) {
                  return resource[name](uriParams, true);
                }));
              } else {
                throw "Error: Unable to find relationship, even on canonical resource";
              }
            } else if (this.relationships[name] instanceof _TemplatedUrlJs.TemplatedUrl) {
              endpoint = relationship.linkedEndpoint(this, uriParams);
            } else {
              endpoint = relationship.embeddedEndpoint(this, uriParams);
            }
            relationship.ResourceClass.resourceDescription.applyToEndpoint(endpoint);
            relationshipUtilities.addMethods(endpoint, this, name);
            return endpoint;
          } else {
            if (this.relationships[name] instanceof _TemplatedUrlJs.TemplatedUrl) {
              throw "Error: non-async relationships must be embedded";
            } else {
              if (uriParams) {
                return this.relationships[name][uriParams];
              } else {
                return this.relationships[name];
              }
            }
          }
        };
      }

      return this._resourceFn;
    }
  }, {
    key: "errorFn",
    get: function () {
      if (!this._errorFn) {
        var name = this.name;
        var path = this.path;
        var relationship = this.relationship;
        this._errorFn = function (uriParams) {
          if (this.relationships[name] instanceof _TemplatedUrlJs.TemplatedUrl) {
            throw "Error: non-async relationships must be embedded";
          } else {
            if (uriParams) {
              return this.relationships[name][uriParams];
            } else {
              return this.relationships[name];
            }
          }
        };
      }
      return this._errorFn;
    }
  }, {
    key: "endpointFn",
    get: function () {

      if (!this._endpointFn) {

        var name = this.name;
        var description = this.relationship.ResourceClass.resourceDescription;
        var relationship = this.relationship;
        var promiseEndpointFactory = this.promiseEndpointFactory;
        this._endpointFn = function () {
          var uriParams = arguments[0] === undefined ? {} : arguments[0];

          // 'this' in here = Endpoint

          var newPromise = this.load().then(function (resource) {
            if (relationship.async) {
              return resource[name](uriParams);
            } else {
              var endpoint = relationship.embeddedEndpoint(resource, uriParams);
              description.applyToEndpoint(endpoint);
              return endpoint;
            }
          });

          var newEndpoint = promiseEndpointFactory(newPromise);

          relationship.decorateEndpoint(newEndpoint, uriParams);
          description.applyToEndpoint(newEndpoint);

          return newEndpoint;
        };
      }

      return this._endpointFn;
    }
  }, {
    key: "resourceApply",
    value: function resourceApply(target) {
      target.constructor.relationships[this.name] = this.relationship;
      this.addFunction(target, this.resourceFn);
    }
  }, {
    key: "errorsApply",
    value: function errorsApply(target) {
      target.constructor.relationships[this.name] = this.relationship;
      this.addFunction(target, this.errorFn);
    }
  }, {
    key: "endpointApply",

    //backend.subone({}).subtwo({})
    //  means
    //backend.subone({}).load().then((subone) => { return subone.subtwo({}) })
    value: function endpointApply(target) {
      this.addFunction(target, this.endpointFn);
    }
  }]);

  RelatedResourceDecorator = (0, _SimpleFactoryInjectorJs.SimpleFactory)("RelatedResourceDecoratorFactory", ["PromiseEndpointFactory", "RelationshipUtilities"])(RelatedResourceDecorator) || RelatedResourceDecorator;
  return RelatedResourceDecorator;
})(_ResourceDecoratorJs2["default"]);

exports["default"] = RelatedResourceDecorator;
module.exports = exports["default"];