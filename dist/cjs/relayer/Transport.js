"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _SimpleFactoryInjectorJs = require("./SimpleFactoryInjector.js");

var Transport = (function () {
  function Transport(urlHelper, $http) {
    _classCallCheck(this, _Transport);

    this.http = $http;
    this.urlHelper = urlHelper;
  }

  var _Transport = Transport;

  _createClass(_Transport, [{
    key: "get",
    value: function get(url) {
      var etag = arguments[1] === undefined ? null : arguments[1];

      var getParams = {
        method: "GET",
        url: this.urlHelper.fullUrl(url)
      };
      if (etag) {
        getParams.headers = {};
        getParams.headers["If-None-Match"] = etag;
      }
      return this.resolve(this.http(getParams));
    }
  }, {
    key: "put",
    value: function put(url, data) {
      var etag = arguments[2] === undefined ? null : arguments[2];

      var putParams = {
        method: "PUT",
        url: this.urlHelper.fullUrl(url),
        data: data
      };
      if (etag) {
        putParams.headers = {};
        putParams.headers["If-Match"] = etag;
      }
      return this.resolve(this.http(putParams));
    }
  }, {
    key: "post",
    value: function post(url, data) {
      return this.resolve(this.http({
        method: "POST",
        url: this.urlHelper.fullUrl(url),
        data: data
      }));
    }
  }, {
    key: "delete",
    value: function _delete(url) {
      return this.resolve(this.http({
        method: "DELETE",
        url: this.urlHelper.fullUrl(url)
      }));
    }
  }, {
    key: "resolve",
    value: function resolve(backendResponds) {
      var _this = this;

      return backendResponds.then(function (fullResponse) {
        if (fullResponse.status === 201 && fullResponse.headers().location) {
          var locationUrl = _this.absolutizeResponseLocation(fullResponse);
          return _this.get(locationUrl);
        } else {
          var response = {};
          response.data = fullResponse.data;
          response.etag = fullResponse.headers().ETag;
          return response;
        }
      }, function (errorResponse) {
        throw errorResponse;
      });
    }
  }, {
    key: "absolutizeResponseLocation",
    value: function absolutizeResponseLocation(fullResponse) {
      return this.urlHelper.checkLocationUrl(fullResponse.headers().location, fullResponse.config.url);
    }
  }]);

  Transport = (0, _SimpleFactoryInjectorJs.SimpleFactory)("TransportFactory", [])(Transport) || Transport;
  return Transport;
})();

exports["default"] = Transport;
module.exports = exports["default"];