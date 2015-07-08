import {describeResource, InitializedResourceClasses, ResourceDescription}from "./relayer/ResourceDescription.js";
import Resource from "./relayer/Resource.js";
import * as Endpoints from "./relayer/endpoints.js";
import * as Serializers from "./relayer/serializers.js";
import * as Mappers from "./relayer/mappers.js";
import * as Transformers from "./relayer/transformers.js";
import * as Initializers from "./relayer/initializers.js";
import * as Decorators from "./relayer/decorators.js";
import * as RelationshipDescriptions from "./relayer/relationshipDescriptions.js";
import ListResource from "./relayer/ListResource.js";
import PrimaryResourceBuilder from "./relayer/PrimaryResourceBuilder.js";
import ResourceBuilder from "./relayer/ResourceBuilder.js";
import Transport from "./relayer/Transport.js";
import UrlHelper from "./relayer/UrlHelper.js";
import * as TemplatedUrls from "./relayer/TemplatedUrl.js";
import {AsModule, Provider} from "a1atscript";
import Inflector from "xing-inflector";

@AsModule('resourceLayer', [
  Endpoints,
  Serializers,
  Mappers,
  Transformers,
  Initializers,
  Decorators,
  RelationshipDescriptions,
  ListResource,
  PrimaryResourceBuilder,
  ResourceBuilder,
  Transport,
  UrlHelper,
  TemplatedUrls,
  ResourceDescription,
  InitializedResourceClasses,
  ResourceBuilder,
  PrimaryResourceBuilder,
  Inflector
])
@Provider('resourceLayer', ['$provide'])
export default class ResourceLayer {

  static get Resource() { return Resource; }

  static get Describe() { return describeResource; }

  constructor($provide) {
    this.apis = {}
    this.$provide = $provide;
    this.$get = ['$injector', ($injector) => {
      var builtApis = {};
      Object.keys(this.apis).forEach((apiName) => {
        buildApis[apiName] = $injector.get(apiName);
      });
      return buildApis;
    }];
  }

  createApi(apiName, topLevelResource, baseUrl) {
    this.apis[apiName] = {
      topLevelResource, baseUrl
    }
    this.$provide.factory(apiName, ['UrlHelperFactory',
      'TransportFactory',
      'TemplatedUrlFromUrlFactory',
      'ResolvedEndpointFactory',
      'PrimaryResourceTransformerFactory',
      'ResourceMapperFactory',
      'ResourceSerializerFactory',
      '$http',
      'InitializedResourceClasses',
      function(urlHelperFactory,
        transportFactory,
        templatedUrlFromUrlFactory,
        resolvedEndpointFactory,
        primaryResourceTransformerFactory,
        resourceMapperFactory,
        resourceSerializerFactory,
        $http,
        initializedResourceClasses) {

        var urlHelper = urlHelperFactory(baseUrl);
        var wellKnownUrl = urlHelper.fullUrlRegEx.exec(baseUrl)[3];
        var transport = transportFactory(urlHelper, $http);
        var templatedUrl = templatedUrlFromUrlFactory(wellKnownUrl, wellKnownUrl);
        var transformer = primaryResourceTransformerFactory(resourceMapperFactory,
          resourceSerializerFactory,
          topLevelResource)
        var endpoint = resolvedEndpointFactory(transport, templatedUrl, transformer);
        topLevelResource.resourceDescription.applyToEndpoint(endpoint);
        return endpoint;
      }
    ]);
  }
}
