import {describeResource} from "./relayer/ResourceInitializer.js";
import Resource from "./relayer/Resource.js";
import Transport from "./relayer/Transport.js";
import UrlHelper from "./relayer/UrlHelper.js";
import {AsModule, Provider} from "a1atscript";
import {setThenFactory as injectQ} from "./relayer/Promise.js";

@AsModule('relayer', [])
@Provider('relayer', ['$provide', "$q"])
export default class ResourceLayer {

  static get Resource() { return Resource; }

  static get Describe() { return describeResource; }

  constructor($provide, $q) {
    this.apis = {};
    this.$provide = $provide;
    injectQ((resolver) => {
      return $q(resolver);
    });
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
    this.$provide.factory(apiName, [ '$http',
      function( $http ) {
        var urlHelper = new UrlHelper(baseUrl);
        var transport = new Transport(urlHelper, $http); // XXX maybe should be "AngularTransport"
        return new TopLevelResourceBuilder(transport, urlHelper, topLevelResource).endpoint;
      }
    ]);
  }
}
