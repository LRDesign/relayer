// the idea is to extract the logic that handles creating the resource class
// from the backend's returned data
// and setting up the data to post to the backend to its own class
// but then that got me thinking this is a better spot in general to add
// customization like lists, admin role endpoints, paginated endpoints, etc
// I even had the idea that these could potentially be chained

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ResourceTransformer = (function () {
  function ResourceTransformer() {
    _classCallCheck(this, ResourceTransformer);
  }

  _createClass(ResourceTransformer, [{
    key: "transformRequest",
    value: function transformRequest(endpoint, resource) {
      return resource;
    }
  }, {
    key: "transformResponse",
    value: function transformResponse(endpoint, response) {
      return response;
    }
  }]);

  return ResourceTransformer;
})();

exports["default"] = ResourceTransformer;
module.exports = exports["default"];