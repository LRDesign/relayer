"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Mapper = (function () {
  function Mapper(transport, response, relationshipDescription) {
    var useErrors = arguments[3] === undefined ? false : arguments[3];

    _classCallCheck(this, Mapper);

    this.transport = transport;
    this.response = response;
    this.relationshipDescription = relationshipDescription;
    this.useErrors = useErrors;
  }

  _createClass(Mapper, [{
    key: "ResourceClass",
    get: function () {
      if (this.useErrors) {
        return this.relationshipDescription.ResourceClass.errorClass;
      } else {
        return this.relationshipDescription.ResourceClass;
      }
    }
  }, {
    key: "mapperFactory",
    get: function () {
      return this.relationshipDescription.mapperFactory;
    }
  }, {
    key: "serializerFactory",
    get: function () {
      return this.relationshipDescription.serializerFactory;
    }
  }, {
    key: "map",
    value: function map() {
      this.initializeModel();
      this.mapNestedRelationships();
      return this.mapped;
    }
  }]);

  return Mapper;
})();

exports["default"] = Mapper;
module.exports = exports["default"];