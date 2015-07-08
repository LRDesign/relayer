"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _SerializerJs = require("./Serializer.js");

var _SerializerJs2 = _interopRequireDefault(_SerializerJs);

var _SimpleFactoryInjectorJs = require("../SimpleFactoryInjector.js");

var _TemplatedUrlJs = require("../TemplatedUrl.js");

var ResourceSerializer = (function (_Serializer) {
  function ResourceSerializer() {
    _classCallCheck(this, _ResourceSerializer);

    if (_Serializer != null) {
      _Serializer.apply(this, arguments);
    }
  }

  _inherits(ResourceSerializer, _Serializer);

  var _ResourceSerializer = ResourceSerializer;

  _createClass(_ResourceSerializer, [{
    key: "serialize",
    value: function serialize() {
      var _this = this;

      var relationship;

      Object.keys(this.resource.relationships).forEach(function (relationshipName) {
        var relationship = _this.resource.relationships[relationshipName];
        if (!(relationship instanceof _TemplatedUrlJs.TemplatedUrl)) {
          var relationshipDefinition = _this.resource.constructor.relationships[relationshipName];
          var serializer = relationshipDefinition.serializerFactory(relationship);
          _this.resource.pathSet(relationshipDefinition.dataPath, serializer.serialize());
        }
      });

      return this.resource.response;
    }
  }]);

  ResourceSerializer = (0, _SimpleFactoryInjectorJs.SimpleFactory)("ResourceSerializerFactory", [])(ResourceSerializer) || ResourceSerializer;
  return ResourceSerializer;
})(_SerializerJs2["default"]);

exports["default"] = ResourceSerializer;
module.exports = exports["default"];