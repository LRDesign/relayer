"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _ResourceJs = require("./Resource.js");

var _ResourceJs2 = _interopRequireDefault(_ResourceJs);

var _a1atscript = require("a1atscript");

var ListResource = (function (_Resource) {
  function ListResource() {
    _classCallCheck(this, _ListResource);

    if (_Resource != null) {
      _Resource.apply(this, arguments);
    }
  }

  _inherits(ListResource, _Resource);

  var _ListResource = ListResource;
  ListResource = (0, _a1atscript.Value)("ListResource")(ListResource) || ListResource;
  return ListResource;
})(_ResourceJs2["default"]);

exports["default"] = ListResource;
module.exports = exports["default"];