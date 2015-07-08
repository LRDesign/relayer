"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.describeResource = describeResource;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _APIErrorJs = require("./APIError.js");

var _APIErrorJs2 = _interopRequireDefault(_APIErrorJs);

var _a1atscript = require("a1atscript");

var _SimpleFactoryInjectorJs = require("./SimpleFactoryInjector.js");

var resourcesToInitialize = [];

function describeResource(resourceClass, defineFn) {
  resourcesToInitialize.push({ resourceClass: resourceClass, defineFn: defineFn });
}

var InitializedResourceClasses = (function () {
  function InitializedResourceClasses(resourceDescriptionFactory) {
    _classCallCheck(this, _InitializedResourceClasses);

    this.resourceDescriptionFactory = resourceDescriptionFactory;
    this.initializeClasses();
  }

  var _InitializedResourceClasses = InitializedResourceClasses;

  _createClass(_InitializedResourceClasses, [{
    key: "initializeClasses",
    value: function initializeClasses() {
      var _this = this;

      resourcesToInitialize.forEach(function (resourceToInitialize) {
        var resourceClass = resourceToInitialize.resourceClass;
        var defineFn = resourceToInitialize.defineFn;
        var resourceDescription = resourceClass.description(_this.resourceDescriptionFactory);
        // wrap-around definitions because...
        defineFn(resourceDescription);
      });

      return resourcesToInitialize.map(function (resourceToInitialize) {
        var resourceClass = resourceToInitialize.resourceClass;
        var resourceDescription = resourceClass.resourceDescription;
        var errorClass = function errorClass(responseData) {
          _APIErrorJs2["default"].call(this);
        };
        errorClass.relationships = {};
        errorClass.prototype = Object.create(_APIErrorJs2["default"].prototype);
        errorClass.prototype.constructor = errorClass;
        resourceDescription.applyToResource(resourceClass.prototype);
        resourceDescription.applyToError(errorClass.prototype);
        resourceClass.errorClass = errorClass;
        return resourceClass;
      });
    }
  }]);

  InitializedResourceClasses = (0, _a1atscript.Service)("InitializedResourceClasses", ["ResourceDescriptionFactory"])(InitializedResourceClasses) || InitializedResourceClasses;
  return InitializedResourceClasses;
})();

exports.InitializedResourceClasses = InitializedResourceClasses;

var ResourceDescription = (function () {
  function ResourceDescription(jsonPropertyDecoratorFactory, relatedResourceDecoratorFactory, singleRelationshipDescriptionFactory, manyRelationshipDescriptionFactory, listRelationshipDescriptionFactory, mapRelationshipDescriptionFactory, inflector) {
    _classCallCheck(this, _ResourceDescription);

    this.jsonPropertyDecoratorFactory = jsonPropertyDecoratorFactory;
    this.relatedResourceDecoratorFactory = relatedResourceDecoratorFactory;
    this.singleRelationshipDescriptionFactory = singleRelationshipDescriptionFactory;
    this.manyRelationshipDescriptionFactory = manyRelationshipDescriptionFactory;
    this.listRelationshipDescriptionFactory = listRelationshipDescriptionFactory;
    this.mapRelationshipDescriptionFactory = mapRelationshipDescriptionFactory;
    this.inflector = inflector;

    this.decorators = {};
    this.allDecorators = [];
    this.parentDescription = null; //automated inheritance?
  }

  var _ResourceDescription = ResourceDescription;

  _createClass(_ResourceDescription, [{
    key: "chainFrom",
    value: function chainFrom(other) {
      if (this.parentDescription && this.parentDescription !== other) {
        throw new Error("Attempted to rechain description: existing parent if of " + ("" + this.parentDescription.ResourceClass + ", new is of " + other.ResourceClass));
      } else {
        this.parentDescription = other;
      }
    }
  }, {
    key: "recordDecorator",
    value: function recordDecorator(name, decoratorDescription) {
      this.decorators[name] = this.decorators[name] || [];
      this.decorators[name].push(decoratorDescription);
      this.allDecorators.push(decoratorDescription);
      return decoratorDescription;
    }
  }, {
    key: "applyToResource",
    value: function applyToResource(resource) {
      this.allDecorators.forEach(function (decorator) {
        decorator.resourceApply(resource);
      });
      if (this.parentDescription) {
        this.parentDescription.applyToResource(resource);
      }
    }
  }, {
    key: "applyToError",
    value: function applyToError(error) {
      this.allDecorators.forEach(function (decorator) {
        decorator.errorsApply(error);
      });
      if (this.parentDescription) {
        this.parentDescription.applyToError(error);
      }
    }
  }, {
    key: "applyToEndpoint",
    value: function applyToEndpoint(endpoint) {
      this.allDecorators.forEach(function (decorator) {
        decorator.endpointApply(endpoint);
      });
      if (this.parentDescription) {
        this.parentDescription.applyToEndpoint(endpoint);
      }
    }
  }, {
    key: "property",
    value: function property(_property, initial) {
      this.jsonProperty(_property, "$.data." + this.inflector.underscore(_property), initial);
    }
  }, {
    key: "hasOne",
    value: function hasOne(property, rezClass, initialValues) {
      return this.relatedResource(property, rezClass, initialValues, this.singleRelationshipDescriptionFactory);
    }
  }, {
    key: "hasMany",
    value: function hasMany(property, rezClass, initialValues) {
      return this.relatedResource(property, rezClass, initialValues, this.manyRelationshipDescriptionFactory);
    }
  }, {
    key: "hasList",
    value: function hasList(property, rezClass, initialValues) {
      return this.relatedResource(property, rezClass, initialValues, this.listRelationshipDescriptionFactory);
    }
  }, {
    key: "hasMap",
    value: function hasMap(property, rezClass, initialValue) {
      return this.relatedResource(property, rezClass, initialValue, this.mapRelationshipDescriptionFactory);
    }
  }, {
    key: "jsonProperty",
    value: function jsonProperty(name, path, value, options) {
      return this.recordDecorator(name, this.jsonPropertyDecoratorFactory(name, path, value, options));
    }
  }, {
    key: "relatedResource",
    value: function relatedResource(property, rezClass, initialValues, relationshipDescriptionFactory) {
      var relationship = relationshipDescriptionFactory(property, rezClass, initialValues);
      this.recordDecorator(name, this.relatedResourceDecoratorFactory(property, relationship));
      return relationship;
    }
  }]);

  ResourceDescription = (0, _SimpleFactoryInjectorJs.SimpleFactory)("ResourceDescriptionFactory", ["JsonPropertyDecoratorFactory", "RelatedResourceDecoratorFactory", "SingleRelationshipDescriptionFactory", "ManyRelationshipDescriptionFactory", "ListRelationshipDescriptionFactory", "MapRelationshipDescriptionFactory", "Inflector"])(ResourceDescription) || ResourceDescription;
  return ResourceDescription;
})();

exports.ResourceDescription = ResourceDescription;