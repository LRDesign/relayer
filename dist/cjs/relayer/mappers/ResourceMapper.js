"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _MapperJs = require("./Mapper.js");

var _MapperJs2 = _interopRequireDefault(_MapperJs);

var _SimpleFactoryInjectorJs = require("../SimpleFactoryInjector.js");

var ResourceMapper = (function (_Mapper) {
  function ResourceMapper(templatedUrlFromUrlFactory, resourceBuilderFactory, primaryResourceBuilderFactory, primaryResourceTransformerFactory, transport, response, ResourceClass, mapperFactory, serializerFactory) {
    var endpoint = arguments[9] === undefined ? null : arguments[9];

    _classCallCheck(this, _ResourceMapper);

    _get(Object.getPrototypeOf(_ResourceMapper.prototype), "constructor", this).call(this, transport, response, ResourceClass, mapperFactory, serializerFactory);

    this.primaryResourceTransformerFactory = primaryResourceTransformerFactory;
    this.templatedUrlFromUrlFactory = templatedUrlFromUrlFactory;
    this.resourceBuilderFactory = resourceBuilderFactory;
    this.primaryResourceBuilderFactory = primaryResourceBuilderFactory;
    this.endpoint = endpoint;
  }

  _inherits(ResourceMapper, _Mapper);

  var _ResourceMapper = ResourceMapper;

  _createClass(_ResourceMapper, [{
    key: "initializeModel",
    value: function initializeModel() {
      if (this.endpoint) {
        this.mapped = this.primaryResourceBuilderFactory(this.response, this.ResourceClass).build(this.endpoint);
      } else {
        this.mapped = this.resourceBuilderFactory(this.transport, this.response, this.primaryResourceTransformer, this.ResourceClass).build(this.uriTemplate);
      }
    }
  }, {
    key: "primaryResourceTransformer",
    get: function () {
      this._primaryResourceTransformer = this._primaryResourceTransformer || this.primaryResourceTransformerFactory(this.mapperFactory, this.serializerFactory, this.ResourceClass);
      return this._primaryResourceTransformer;
    }
  }, {
    key: "mapNestedRelationships",
    value: function mapNestedRelationships() {
      var relationship;

      this.mapped.relationships = {};
      for (var relationshipName in this.ResourceClass.relationships) {
        if (typeof this.ResourceClass.relationships[relationshipName] == "object") {
          relationship = this.ResourceClass.relationships[relationshipName];

          if (this.mapped.pathGet(relationship.dataPath)) {
            var subMapper = relationship.mapperFactory(this.transport, this.mapped.pathGet(relationship.dataPath), relationship.ResourceClass, relationship.mapperFactory, relationship.serializerFactory);
            this.mapped.relationships[relationshipName] = subMapper.map();
          } else if (this.mapped.pathGet(relationship.linksPath)) {
            var templatedUrl = this.templatedUrlFromUrlFactory(this.mapped.pathGet(relationship.linksPath), this.mapped.pathGet(relationship.linksPath));
            templatedUrl.addDataPathLink(this.mapped, relationship.linksPath);
            this.mapped.relationships[relationshipName] = templatedUrl;
          }
        }
      }
    }
  }]);

  ResourceMapper = (0, _SimpleFactoryInjectorJs.SimpleFactory)("ResourceMapperFactory", ["TemplatedUrlFromUrlFactory", "ResourceBuilderFactory", "PrimaryResourceBuilderFactory", "PrimaryResourceTransformerFactory"])(ResourceMapper) || ResourceMapper;
  return ResourceMapper;
})(_MapperJs2["default"]);

exports["default"] = ResourceMapper;
module.exports = exports["default"];