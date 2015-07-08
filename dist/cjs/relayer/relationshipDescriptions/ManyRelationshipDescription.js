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

var ManyRelationshipDescription = (function (_MultipleRelationshipDescription) {
  function ManyRelationshipDescription() {
    _classCallCheck(this, _ManyRelationshipDescription);

    if (_MultipleRelationshipDescription != null) {
      _MultipleRelationshipDescription.apply(this, arguments);
    }
  }

  _inherits(ManyRelationshipDescription, _MultipleRelationshipDescription);

  var _ManyRelationshipDescription = ManyRelationshipDescription;
  ManyRelationshipDescription = (0, _SimpleFactoryInjectorJs.SimpleFactory)("ManyRelationshipDescriptionFactory", ["ManyRelationshipInitializerFactory", "ManyResourceMapperFactory", "ManyResourceSerializerFactory", "Inflector", "EmbeddedRelationshipTransformerFactory", "SingleFromManyTransformerFactory", "LoadedDataEndpointFactory"])(ManyRelationshipDescription) || ManyRelationshipDescription;
  return ManyRelationshipDescription;
})(_MultipleRelationshipDescriptionJs2["default"]);

exports["default"] = ManyRelationshipDescription;
module.exports = exports["default"];