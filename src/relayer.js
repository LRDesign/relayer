import {AsModule, Provider}    from "a1atscript";
import {ResourceDescriptionTool}      from "./relayer/ResourceInitializer.js";
import Resource                from "./relayer/Resource.js";
import Transport               from "./relayer/Transport.js";
import UrlHelper               from "./relayer/UrlHelper.js";
import Services                from "./relayer/ServiceLocator.js";
import TopLevelResourceBuilder from "./relayer/TopLevelResource.js";
import Inflector               from 'xing-inflector';
import ResourceDescription     from "./relayer/ResourceDescription.js";

var inflector = new Inflector();
var theDescriber = new ResourceDescriptionTool(() => new ResourceDescription(inflector));

@AsModule('relayer', [])
@Provider('relayer', ['$provide'])
export default class ResourceLayer {
  static get Resource() { return Resource; }

  static Describe(resourceClass, defineFn) {
    return theDescriber.initializeClass(resourceClass, defineFn);
  }

  constructor($provide) {
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
    this.apis[apiName] = {
      topLevelResource, baseUrl
    };
    this.$provide.factory(apiName, [ '$http', '$q',
      function( $http, $q ) {
        var urlHelper = new UrlHelper(baseUrl);
        var services = new Services();

        services.buildThenable = function(resolver) {
          return $q(resolver);
        };
        services.baseUrl = baseUrl;
        // transport becomes API specific locator
        // Services becomes Relayer wide.
        // urlHelper becomes member of transport
        services.transport = new Transport(services.urlHelper, $http); // XXX maybe should be "AngularTransport"

        return new TopLevelResourceBuilder(services, topLevelResource).endpoint;
      }
    ]);
  }
}
