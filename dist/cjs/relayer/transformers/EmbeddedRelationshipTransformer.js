"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _ResourceTransformerJs = require("./ResourceTransformer.js");

var _ResourceTransformerJs2 = _interopRequireDefault(_ResourceTransformerJs);

var _SimpleFactoryInjectorJs = require("../SimpleFactoryInjector.js");

var EmbeddedRelationshipTransformer = (function (_ResourceTransformer) {
  function EmbeddedRelationshipTransformer(relationshipName) {
    _classCallCheck(this, _EmbeddedRelationshipTransformer);

    _get(Object.getPrototypeOf(_EmbeddedRelationshipTransformer.prototype), "constructor", this).call(this);
    this.relationshipName = relationshipName;
  }

  _inherits(EmbeddedRelationshipTransformer, _ResourceTransformer);

  var _EmbeddedRelationshipTransformer = EmbeddedRelationshipTransformer;

  _createClass(_EmbeddedRelationshipTransformer, [{
    key: "transformRequest",
    value: function transformRequest(endpoint, value) {
      var resource = endpoint.resource;
      resource.relationships[this.relationshipName] = value;
      return resource;
    }
  }, {
    key: "transformResponse",
    value: function transformResponse(endpoint, response) {
      var _this = this;

      return response.then(function (resource) {
        endpoint.resource = resource;
        return resource.relationships[_this.relationshipName];
      })["catch"](function (error) {
        throw error.relationships[_this.relationshipName];
      });
    }
  }]);

  EmbeddedRelationshipTransformer = (0, _SimpleFactoryInjectorJs.SimpleFactory)("EmbeddedRelationshipTransformerFactory")(EmbeddedRelationshipTransformer) || EmbeddedRelationshipTransformer;
  return EmbeddedRelationshipTransformer;
})(_ResourceTransformerJs2["default"]);

exports["default"] = EmbeddedRelationshipTransformer;
module.exports = exports["default"];