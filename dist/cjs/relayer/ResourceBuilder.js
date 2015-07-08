"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _SimpleFactoryInjectorJs = require("./SimpleFactoryInjector.js");

var ResourceBuilder = (function () {
  function ResourceBuilder(templatedUrlFromUrlFactory, resolvedEndpointFactory, primaryResourceTransformerFactory, throwErrorTransformerFactory, transport, response, mapperFactory, serializerFactory, ResourceClass) {
    _classCallCheck(this, _ResourceBuilder);

    this.transport = transport;
    this.ResourceClass = ResourceClass;
    this.templatedUrlFromUrlFactory = templatedUrlFromUrlFactory;
    this.resolvedEndpointFactory = resolvedEndpointFactory;
    this.primaryResourceTransformerFactory = primaryResourceTransformerFactory;
    this.throwErrorTransformerFactory = throwErrorTransformerFactory;
    this.response = response;
    this.mapperFactory = mapperFactory;
    this.serializerFactory = serializerFactory;
  }

  var _ResourceBuilder = ResourceBuilder;

  _createClass(_ResourceBuilder, [{
    key: "build",
    value: function build() {
      var uriTemplate = arguments[0] === undefined ? null : arguments[0];

      var resource = new this.ResourceClass(this.response);
      if (resource.pathGet("$.links.self")) {
        if (uriTemplate) {
          resource.templatedUrl = this.templatedUrlFromUrlFactory(uriTemplate, resource.pathGet("$.links.self"));
        } else {
          resource.templatedUrl = this.templatedUrlFromUrlFactory(resource.pathGet("$.links.self"), resource.pathGet("$.links.self"));
        }
        resource.templatedUrl.addDataPathLink(resource, "$.links.self");
        var resourceTransformer = this.primaryResourceTransformerFactory(this.mapperFactory, this.serializerFactory, this.ResourceClass);
        var createResourceTransformer = this.throwErrorTransformerFactory();
        var endpoint = this.resolvedEndpointFactory(this.transport, resource.templatedUrl, resourceTransformer, createResourceTransformer);
        resource.self = function () {
          return endpoint;
        };
      }
      return resource;
    }
  }]);

  ResourceBuilder = (0, _SimpleFactoryInjectorJs.SimpleFactory)("ResourceBuilderFactory", ["TemplatedUrlFromUrlFactory", "ResolvedEndpointFactory", "PrimaryResourceTransformerFactory", "ThrowErrorTransformerFactory"])(ResourceBuilder) || ResourceBuilder;
  return ResourceBuilder;
})();

exports["default"] = ResourceBuilder;
module.exports = exports["default"];