"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _PrimaryResourceTransformerJs = require("./PrimaryResourceTransformer.js");

var _PrimaryResourceTransformerJs2 = _interopRequireDefault(_PrimaryResourceTransformerJs);

var _SimpleFactoryInjectorJs = require("../SimpleFactoryInjector.js");

var CreateResourceTransformer = (function (_PrimaryResourceTransformer) {
  function CreateResourceTransformer() {
    _classCallCheck(this, _CreateResourceTransformer);

    if (_PrimaryResourceTransformer != null) {
      _PrimaryResourceTransformer.apply(this, arguments);
    }
  }

  _inherits(CreateResourceTransformer, _PrimaryResourceTransformer);

  var _CreateResourceTransformer = CreateResourceTransformer;

  _createClass(_CreateResourceTransformer, [{
    key: "transformResponse",
    value: function transformResponse(endpoint, response) {
      var _this = this;

      return response.then(function (resolvedResponse) {
        var resource = _this.primaryResourceMapperFactory(endpoint.transport, resolvedResponse.data, _this.ResourceClass).map();
        resource.templatedUrl.etag = resolvedResponse.etag;
        return resource;
      })["catch"](function (resolvedError) {
        throw _this.primaryResourceMapperFactory(endpoint.transport, resolvedError.data, _this.ResourceClass.errorClass).map();
      });
    }
  }]);

  CreateResourceTransformer = (0, _SimpleFactoryInjectorJs.SimpleFactory)("CreateResourceTransformerFactory", [])(CreateResourceTransformer) || CreateResourceTransformer;
  return CreateResourceTransformer;
})(_PrimaryResourceTransformerJs2["default"]);

exports["default"] = CreateResourceTransformer;
module.exports = exports["default"];