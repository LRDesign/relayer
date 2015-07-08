"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _relayerResourceDescriptionJs = require("./relayer/ResourceDescription.js");

var _relayerResourceJs = require("./relayer/Resource.js");

var _relayerResourceJs2 = _interopRequireDefault(_relayerResourceJs);

var _relayerEndpointsJs = require("./relayer/endpoints.js");

var Endpoints = _interopRequireWildcard(_relayerEndpointsJs);

var _relayerSerializersJs = require("./relayer/serializers.js");

var Serializers = _interopRequireWildcard(_relayerSerializersJs);

var _relayerMappersJs = require("./relayer/mappers.js");

var Mappers = _interopRequireWildcard(_relayerMappersJs);

var _relayerTransformersJs = require("./relayer/transformers.js");

var Transformers = _interopRequireWildcard(_relayerTransformersJs);

var _relayerInitializersJs = require("./relayer/initializers.js");

var Initializers = _interopRequireWildcard(_relayerInitializersJs);

var _relayerDecoratorsJs = require("./relayer/decorators.js");

var Decorators = _interopRequireWildcard(_relayerDecoratorsJs);

var _relayerRelationshipDescriptionsJs = require("./relayer/relationshipDescriptions.js");

var RelationshipDescriptions = _interopRequireWildcard(_relayerRelationshipDescriptionsJs);

var _relayerListResourceJs = require("./relayer/ListResource.js");

var _relayerListResourceJs2 = _interopRequireDefault(_relayerListResourceJs);

var _relayerPrimaryResourceBuilderJs = require("./relayer/PrimaryResourceBuilder.js");

var _relayerPrimaryResourceBuilderJs2 = _interopRequireDefault(_relayerPrimaryResourceBuilderJs);

var _relayerResourceBuilderJs = require("./relayer/ResourceBuilder.js");

var _relayerResourceBuilderJs2 = _interopRequireDefault(_relayerResourceBuilderJs);

var _relayerTransportJs = require("./relayer/Transport.js");

var _relayerTransportJs2 = _interopRequireDefault(_relayerTransportJs);

var _relayerUrlHelperJs = require("./relayer/UrlHelper.js");

var _relayerUrlHelperJs2 = _interopRequireDefault(_relayerUrlHelperJs);

var _relayerTemplatedUrlJs = require("./relayer/TemplatedUrl.js");

var TemplatedUrls = _interopRequireWildcard(_relayerTemplatedUrlJs);

var _a1atscript = require("a1atscript");

var _xingInflector = require("xing-inflector");

var _xingInflector2 = _interopRequireDefault(_xingInflector);

var ResourceLayer = (function () {
  function ResourceLayer($provide) {
    var _this = this;

    _classCallCheck(this, _ResourceLayer);

    this.apis = {};
    this.$provide = $provide;
    this.$get = ["$injector", function ($injector) {
      var builtApis = {};
      Object.keys(_this.apis).forEach(function (apiName) {
        buildApis[apiName] = $injector.get(apiName);
      });
      return buildApis;
    }];
  }

  var _ResourceLayer = ResourceLayer;

  _createClass(_ResourceLayer, [{
    key: "createApi",
    value: function createApi(apiName, topLevelResource, baseUrl) {
      this.apis[apiName] = {
        topLevelResource: topLevelResource, baseUrl: baseUrl
      };
      this.$provide.factory(apiName, ["UrlHelperFactory", "TransportFactory", "TemplatedUrlFromUrlFactory", "ResolvedEndpointFactory", "PrimaryResourceTransformerFactory", "ResourceMapperFactory", "ResourceSerializerFactory", "$http", "InitializedResourceClasses", function (urlHelperFactory, transportFactory, templatedUrlFromUrlFactory, resolvedEndpointFactory, primaryResourceTransformerFactory, resourceMapperFactory, resourceSerializerFactory, $http, initializedResourceClasses) {

        var urlHelper = urlHelperFactory(baseUrl);
        var wellKnownUrl = urlHelper.fullUrlRegEx.exec(baseUrl)[3];
        var transport = transportFactory(urlHelper, $http);
        var templatedUrl = templatedUrlFromUrlFactory(wellKnownUrl, wellKnownUrl);
        var transformer = primaryResourceTransformerFactory(resourceMapperFactory, resourceSerializerFactory, topLevelResource);
        var endpoint = resolvedEndpointFactory(transport, templatedUrl, transformer);
        topLevelResource.resourceDescription.applyToEndpoint(endpoint);
        return endpoint;
      }]);
    }
  }], [{
    key: "Resource",
    get: function () {
      return _relayerResourceJs2["default"];
    }
  }, {
    key: "Describe",
    get: function () {
      return _relayerResourceDescriptionJs.describeResource;
    }
  }]);

  ResourceLayer = (0, _a1atscript.Provider)("relayer", ["$provide"])(ResourceLayer) || ResourceLayer;
  ResourceLayer = (0, _a1atscript.AsModule)("relayer", [Endpoints, Serializers, Mappers, Transformers, Initializers, Decorators, RelationshipDescriptions, _relayerListResourceJs2["default"], _relayerPrimaryResourceBuilderJs2["default"], _relayerResourceBuilderJs2["default"], _relayerTransportJs2["default"], _relayerUrlHelperJs2["default"], TemplatedUrls, _relayerResourceDescriptionJs.ResourceDescription, _relayerResourceDescriptionJs.InitializedResourceClasses, _relayerResourceBuilderJs2["default"], _relayerPrimaryResourceBuilderJs2["default"], _xingInflector2["default"]])(ResourceLayer) || ResourceLayer;
  return ResourceLayer;
})();

exports["default"] = ResourceLayer;
module.exports = exports["default"];