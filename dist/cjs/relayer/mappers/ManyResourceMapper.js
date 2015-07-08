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

var _MapperJs = require("./Mapper.js");

var _MapperJs2 = _interopRequireDefault(_MapperJs);

var ManyResourceMapper = (function (_Mapper) {
  function ManyResourceMapper(singleResourceMapperFactory, singleResourceSerializerFactory, transport, response, ResourceClass) {
    _classCallCheck(this, _ManyResourceMapper);

    _get(Object.getPrototypeOf(_ManyResourceMapper.prototype), "constructor", this).call(this, transport, response, ResourceClass);
    this.singleResourceMapperFactory = singleResourceMapperFactory;
    this.singleResourceSerializerFactory = singleResourceSerializerFactory;
  }

  _inherits(ManyResourceMapper, _Mapper);

  var _ManyResourceMapper = ManyResourceMapper;

  _createClass(_ManyResourceMapper, [{
    key: "initializeModel",
    value: function initializeModel() {
      this.mapped = [];
    }
  }, {
    key: "mapNestedRelationships",
    value: function mapNestedRelationships() {
      var _this = this;

      this.response.forEach(function (response) {
        var resourceMapper = _this.singleResourceMapperFactory(_this.transport, response, _this.ResourceClass, _this.singleResourceMapperFactory, _this.singleResourceSerializerFactory);
        resourceMapper.uriTemplate = _this.uriTemplate;
        _this.mapped.push(resourceMapper.map());
      });
    }
  }]);

  ManyResourceMapper = (0, _SimpleFactoryInjectorJs.SimpleFactory)("ManyResourceMapperFactory", ["ResourceMapperFactory", "ResourceSerializerFactory"])(ManyResourceMapper) || ManyResourceMapper;
  return ManyResourceMapper;
})(_MapperJs2["default"]);

exports["default"] = ManyResourceMapper;
module.exports = exports["default"];