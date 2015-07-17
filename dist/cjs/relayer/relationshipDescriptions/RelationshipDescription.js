"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RelationshipDescription = (function () {
  function RelationshipDescription(relationshipInitializerFactory, resourceMapperFactory, resourceSerializerFactory, inflector, name, ResourceClass, initialValues) {
    _classCallCheck(this, RelationshipDescription);

    this.initializer = relationshipInitializerFactory(ResourceClass, initialValues);
    this.mapperFactory = resourceMapperFactory;
    this.serializerFactory = resourceSerializerFactory;
    this.inflector = inflector;
    this.name = name;
    this.ResourceClass = ResourceClass;
    this.initialValues = initialValues;
    this.async = true;
    if (initialValues == undefined) {
      this.initializeOnCreate = false;
    } else {
      this.initializeOnCreate = true;
    }
  }

  _createClass(RelationshipDescription, [{
    key: "linksPath",
    get: function () {
      this._linksPath = this._linksPath || "$.links." + this.inflector.underscore(this.name);
      return this._linksPath;
    },
    set: function (linksPath) {
      this._linksPath = linksPath;
      return this._linksPath;
    }
  }, {
    key: "dataPath",
    get: function () {
      this._dataPath = this._dataPath || "$.data." + this.inflector.underscore(this.name);
      return this._dataPath;
    },
    set: function (dataPath) {
      this._dataPath = dataPath;
      return this._dataPath;
    }
  }, {
    key: "decorateEndpoint",
    value: function decorateEndpoint(endpoint, uriParams) {}
  }]);

  return RelationshipDescription;
})();

exports["default"] = RelationshipDescription;
module.exports = exports["default"];

// override