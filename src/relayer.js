import {AsModule, Provider}    from "a1atscript";
import {describeResource}      from "./relayer/ResourceInitializer.js";
import Resource                from "./relayer/Resource.js";
import Transport               from "./relayer/Transport.js";
import UrlHelper               from "./relayer/UrlHelper.js";
import Services                from "./relayer/ServiceLocator.js";
import TopLevelResourceBuilder from "./relayer/TopLevelResource.js";

@AsModule('relayer', [])
@Provider('relayer', ['$provide'])
export default class ResourceLayer {

  static get Resource() { return Resource; }

  static get Describe() { return describeResource; }

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
    console.log(apiName, topLevelResource, baseUrl);
    this.apis[apiName] = {
      topLevelResource, baseUrl
    };
    this.$provide.factory(apiName, [ '$http', '$q',
      function( $http, $q ) {
        console.log("src/relayer.js:36", "topLevelResource", topLevelResource);
        var services = new Services();
        services.thenableBuilder = function(resolver) {
          return $q(resolver);
        };

        services.baseUrl = baseUrl;
        services.transport = new Transport(services.urlHelper, $http); // XXX maybe should be "AngularTransport"

        return new TopLevelResourceBuilder(services, topLevelResource).endpoint;
      }
    ]);
  }
}
