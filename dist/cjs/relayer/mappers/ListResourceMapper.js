"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _SimpleFactoryInjectorJs = require("../SimpleFactoryInjector.js");

var _ResourceMapperJs = require("./ResourceMapper.js");

var _ResourceMapperJs2 = _interopRequireDefault(_ResourceMapperJs);

var ListResourceMapper = (function (_ResourceMapper) {
  function ListResourceMapper(templatedUrlFromUrlFactory, resourceBuilderFactory, primaryResourceBuilderFactory, primaryResourceTransformerFactory, ListResource, manyResourceMapperFactory, transport, response, ItemResourceClass, mapperFactory, serializerFactory, endpoint) {
    _classCallCheck(this, _ListResourceMapper);

    _get(Object.getPrototypeOf(_ListResourceMapper.prototype), "constructor", this).call(this, templatedUrlFromUrlFactory, resourceBuilderFactory, primaryResourceBuilderFactory, primaryResourceTransformerFactory, transport, response, ListResource, mapperFactory, serializerFactory);
    this.ItemResourceClass = ItemResourceClass;
    this.manyResourceMapperFactory = manyResourceMapperFactory;
    this.endpoint = endpoint;
  }

  _inherits(ListResourceMapper, _ResourceMapper);

  var _ListResourceMapper = ListResourceMapper;

  _createClass(_ListResourceMapper, [{
    key: "primaryResourceTransformer",
    get: function () {
      this._primaryResourceTransformer = this._primaryResourceTransformer || this.primaryResourceTransformerFactory(this.mapperFactory, this.serializerFactory, this.ItemResourceClass);
      return this._primaryResourceTransformer;
    }
  }, {
    key: "mapNestedRelationships",
    value: function mapNestedRelationships() {
      var _this = this;

      this.resource = this.mapped;
      var manyResourceMapper = this.manyResourceMapperFactory(this.transport, this.resource.pathGet("$.data"), this.ItemResourceClass);
      manyResourceMapper.uriTemplate = this.resource.pathGet("$.links.template");
      this.mapped = manyResourceMapper.map();
      this.mapped.resource = this.resource;
      ["url", "uriTemplate", "uriParams"].forEach(function (func) {
        _this.mapped[func] = function () {
          var _resource;

          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return (_resource = this.resource)[func].apply(_resource, args);
        };
      });
      var mapped = this.mapped;
      ["remove", "update", "load"].forEach(function (func) {
        _this.mapped[func] = function () {
          var _resource$self;

          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          return (_resource$self = this.resource.self())[func].apply(_resource$self, [mapped].concat(args));
        };
      });
      this.mapped.create = function () {
        var _resource2,
            _this2 = this;

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        return (_resource2 = this.resource).create.apply(_resource2, args).then(function (created) {
          _this2.push(created);
          return created;
        });
      };

      var ItemResourceClass = this.ItemResourceClass;
      this.mapped["new"] = function () {
        return new ItemResourceClass();
      };
    }
  }]);

  ListResourceMapper = (0, _SimpleFactoryInjectorJs.SimpleFactory)("ListResourceMapperFactory", ["TemplatedUrlFromUrlFactory", "ResourceBuilderFactory", "PrimaryResourceBuilderFactory", "PrimaryResourceTransformerFactory", "ListResource", "ManyResourceMapperFactory"])(ListResourceMapper) || ListResourceMapper;
  return ListResourceMapper;
})(_ResourceMapperJs2["default"]);

exports["default"] = ListResourceMapper;
module.exports = exports["default"];