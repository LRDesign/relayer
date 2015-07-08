"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ResourceDecorator = (function () {
  function ResourceDecorator(name) {
    _classCallCheck(this, ResourceDecorator);

    this.name = name;
  }

  _createClass(ResourceDecorator, [{
    key: "addFunction",
    value: function addFunction(target, func) {
      if (!target.hasOwnProperty(this.name)) {
        target[this.name] = func;
      }
    }
  }, {
    key: "resourceApply",
    value: function resourceApply(resource) {}
  }, {
    key: "errorsApply",
    value: function errorsApply(errors) {}
  }, {
    key: "endpointApply",
    value: function endpointApply(endpoint) {}
  }]);

  return ResourceDecorator;
})();

exports["default"] = ResourceDecorator;
module.exports = exports["default"];

//no-op

//no-op

//no-op