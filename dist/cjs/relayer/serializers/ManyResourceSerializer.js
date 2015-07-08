"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _SerializerJs = require("./Serializer.js");

var _SerializerJs2 = _interopRequireDefault(_SerializerJs);

var _SimpleFactoryInjectorJs = require("../SimpleFactoryInjector.js");

var ManyResourceSerializer = (function (_Serializer) {
  function ManyResourceSerializer(resourceSerializerFactory, resource) {
    _classCallCheck(this, _ManyResourceSerializer);

    _get(Object.getPrototypeOf(_ManyResourceSerializer.prototype), "constructor", this).call(this, resource);
    this.resourceSerializerFactory = resourceSerializerFactory;
  }

  _inherits(ManyResourceSerializer, _Serializer);

  var _ManyResourceSerializer = ManyResourceSerializer;

  _createClass(_ManyResourceSerializer, [{
    key: "serialize",
    value: function serialize() {
      var _this = this;

      return this.resource.map(function (resource) {
        return _this.resourceSerializerFactory(resource).serialize();
      });
    }
  }]);

  ManyResourceSerializer = (0, _SimpleFactoryInjectorJs.SimpleFactory)("ManyResourceSerializerFactory", ["ResourceSerializerFactory"])(ManyResourceSerializer) || ManyResourceSerializer;
  return ManyResourceSerializer;
})(_SerializerJs2["default"]);

exports["default"] = ManyResourceSerializer;
module.exports = exports["default"];