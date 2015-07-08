"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _RelationshipInitializerJs = require("./RelationshipInitializer.js");

var _RelationshipInitializerJs2 = _interopRequireDefault(_RelationshipInitializerJs);

var _SimpleFactoryInjectorJs = require("../SimpleFactoryInjector.js");

var SingleRelationshipInitializer = (function (_RelationshipInitializer) {
  function SingleRelationshipInitializer() {
    _classCallCheck(this, _SingleRelationshipInitializer);

    if (_RelationshipInitializer != null) {
      _RelationshipInitializer.apply(this, arguments);
    }
  }

  _inherits(SingleRelationshipInitializer, _RelationshipInitializer);

  var _SingleRelationshipInitializer = SingleRelationshipInitializer;

  _createClass(_SingleRelationshipInitializer, [{
    key: "initialize",
    value: function initialize() {
      var _this = this;

      var relationship = new this.ResourceClass();
      Object.keys(this.initialValues).forEach(function (property) {
        relationship[property] = _this.initialValues[property];
      });
      return relationship;
    }
  }]);

  SingleRelationshipInitializer = (0, _SimpleFactoryInjectorJs.SimpleFactory)("SingleRelationshipInitializerFactory", [])(SingleRelationshipInitializer) || SingleRelationshipInitializer;
  return SingleRelationshipInitializer;
})(_RelationshipInitializerJs2["default"]);

exports["default"] = SingleRelationshipInitializer;
module.exports = exports["default"];