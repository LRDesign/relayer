"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _a1atscript = require("a1atscript");

var _TemplatedUrlJs = require("./TemplatedUrl.js");

var RelationshipUtilities = (function () {
  function RelationshipUtilities() {
    _classCallCheck(this, _RelationshipUtilities);
  }

  var _RelationshipUtilities = RelationshipUtilities;

  _createClass(_RelationshipUtilities, [{
    key: "addMethods",
    value: function addMethods(target, resource, name) {
      target.get = function () {
        return resource.relationships[name];
      };
      target.present = function () {
        return resource.relationships[name] ? true : false;
      };
      target.set = function (newRelationship) {
        var linksPath = resource.constructor.relationships[name].linksPath;
        if (resource.relationships[name] instanceof _TemplatedUrlJs.TemplatedUrl) {
          resource.relationships[name].removeDataPathLink(resource, linksPath);
          if (!newRelationship) {
            resource.pathSet(linksPath, "");
          }
        }
        if (newRelationship instanceof _TemplatedUrlJs.TemplatedUrl) {
          newRelationship.addDataPathLink(resource, linksPath, false);
        }
        resource.relationships[name] = newRelationship;
        if (!resource.relationships[name]) {
          delete resource.relationships[name];
        }
      };
    }
  }]);

  RelationshipUtilities = (0, _a1atscript.Service)("RelationshipUtilities")(RelationshipUtilities) || RelationshipUtilities;
  return RelationshipUtilities;
})();

exports["default"] = RelationshipUtilities;
module.exports = exports["default"];