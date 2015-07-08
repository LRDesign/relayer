"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _DataWrapperJs = require("./DataWrapper.js");

var _DataWrapperJs2 = _interopRequireDefault(_DataWrapperJs);

var APIError = (function (_DataWrapper) {
  function APIError(responseData) {
    var _this = this;

    _classCallCheck(this, APIError);

    _get(Object.getPrototypeOf(APIError.prototype), "constructor", this).call(this);
    this._response = responseData.data;
    this.unhandled = [];
    if (this.jsonPaths) {
      this.unhandled = Object.getOwnPropertyNames(this.jsonPaths).filter(function (name) {
        return _this[name] && _this[name].message;
      }).map(function (name) {
        return name;
      });
    }
  }

  _inherits(APIError, _DataWrapper);

  _createClass(APIError, [{
    key: "handleMessage",
    value: function handleMessage(attrName) {
      if (this[attrName]) {
        this.unhandled = this.unhandled.filter(function (name) {
          return name != attrName;
        });
        return this[attrName].message;
      }
    }
  }]);

  return APIError;
})(_DataWrapperJs2["default"]);

exports["default"] = APIError;
module.exports = exports["default"];