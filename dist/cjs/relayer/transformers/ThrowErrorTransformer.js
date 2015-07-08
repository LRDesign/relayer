"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _ResourceTransformerJs = require("./ResourceTransformer.js");

var _ResourceTransformerJs2 = _interopRequireDefault(_ResourceTransformerJs);

var _SimpleFactoryInjectorJs = require("../SimpleFactoryInjector.js");

var ThrowErrorTransformer = (function (_ResourceTransformer) {
  function ThrowErrorTransformer() {
    _classCallCheck(this, _ThrowErrorTransformer);

    if (_ResourceTransformer != null) {
      _ResourceTransformer.apply(this, arguments);
    }
  }

  _inherits(ThrowErrorTransformer, _ResourceTransformer);

  var _ThrowErrorTransformer = ThrowErrorTransformer;

  _createClass(_ThrowErrorTransformer, [{
    key: "transformRequest",
    value: function transformRequest(endpoint, resource) {
      throw "This Resource Cannot Be Updated Or Created";
    }
  }, {
    key: "transformResponse",
    value: function transformResponse(endpoint, response) {
      throw "There is no Resource To Create From This Response";
    }
  }]);

  ThrowErrorTransformer = (0, _SimpleFactoryInjectorJs.SimpleFactory)("ThrowErrorTransformerFactory")(ThrowErrorTransformer) || ThrowErrorTransformer;
  return ThrowErrorTransformer;
})(_ResourceTransformerJs2["default"]);

exports["default"] = ThrowErrorTransformer;
module.exports = exports["default"];