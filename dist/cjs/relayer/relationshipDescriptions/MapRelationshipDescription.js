"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _MultipleRelationshipDescriptionJs = require("./MultipleRelationshipDescription.js");

var _MultipleRelationshipDescriptionJs2 = _interopRequireDefault(_MultipleRelationshipDescriptionJs);

var _SimpleFactoryInjectorJs = require("../SimpleFactoryInjector.js");

var MapRelationshipDescription = (function (_MultipleRelationshipDescription) {
  function MapRelationshipDescription() {
    _classCallCheck(this, _MapRelationshipDescription);

    if (_MultipleRelationshipDescription != null) {
      _MultipleRelationshipDescription.apply(this, arguments);
    }
  }

  _inherits(MapRelationshipDescription, _MultipleRelationshipDescription);

  var _MapRelationshipDescription = MapRelationshipDescription;
  MapRelationshipDescription = (0, _SimpleFactoryInjectorJs.SimpleFactory)("MapRelationshipDescriptionFactory", ["MapRelationshipInitializerFactory", "MapResourceMapperFactory", "MapResourceSerializerFactory", "Inflector", "EmbeddedRelationshipTransformerFactory", "SingleFromManyTransformerFactory", "LoadedDataEndpointFactory"])(MapRelationshipDescription) || MapRelationshipDescription;
  return MapRelationshipDescription;
})(_MultipleRelationshipDescriptionJs2["default"]);

exports["default"] = MapRelationshipDescription;
module.exports = exports["default"];