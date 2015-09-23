import {AsModule, Provider}      from "a1atscript";
import {ResourceDescriptionTool} from "./relayer/ResourceInitializer.js";
import Resource                  from "./relayer/Resource.js";
import Transport                 from "./relayer/Transport.js";
import UrlHelper                 from "./relayer/UrlHelper.js";
import Services                  from "./relayer/ServiceLocator.js";
import TopLevelResourceBuilder   from "./relayer/TopLevelResource.js";
import ResourceDescription       from "./relayer/ResourceDescription.js";
import Inflector                 from "xing-inflector";

var theServices = new Services();

function buildResourceDescription(){
  return new ResourceDescription(new Inflector());
}
var theDescriber = new ResourceDescriptionTool(buildResourceDescription);

@AsModule('relayer', [])
@Provider('relayer', ['$provide', '$q'])
export default class ResourceLayer {
  static get services() { return theServices; }

  static get Resource() { return Resource; }

  static Describe(resourceClass, defineFn) {
    return theDescriber.initializeClass(resourceClass, defineFn);
  }

  constructor($provide, $q) {
    // Maybe the promise wrapping goes on transport?
    ResourceLayer.services.thenableBuilder = function(resolver) {
      return $q(resolver);
    };
    this.apis = {};
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
    console.log(apiName, topLevelResource, baseUrl);
    this.apis[apiName] = {
      topLevelResource, baseUrl
    };
    this.$provide.factory(apiName, [ '$http', '$q',
      function( $http, $q ) {
        var urlHelper = new UrlHelper(baseUrl);

        var apiLocator = new APILocator(ResourceLayer.services);
        apiLocator.transport = new Transport(urlHelper, $http);

        return new TopLevelResourceBuilder(apiLocator, topLevelResource).endpoint;
      }
    ]);
  }
}
