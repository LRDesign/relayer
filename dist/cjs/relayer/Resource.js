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

var paths = {
  publicUrl: "$.links.public",
  adminUrl: "$.links.admin",
  selfUrl: "$.links.self"
};

var Resource = (function (_DataWrapper) {
  function Resource(responseData) {
    _classCallCheck(this, Resource);

    _get(Object.getPrototypeOf(Resource.prototype), "constructor", this).call(this, responseData);
    if (!responseData) {
      this.emptyData();
    }
    this.errorReason = null;
    this.templatedUrl = null;
    this.resolved = false;
    this._dirty = false;
  }

  _inherits(Resource, _DataWrapper);

  _createClass(Resource, [{
    key: "url",
    get: function () {
      return this.templatedUrl && this.templatedUrl.url;
    }
  }, {
    key: "uriTemplate",
    get: function () {
      return this.templatedUrl && this.templatedUrl.uriTemplate;
    }
  }, {
    key: "uriParams",
    get: function () {
      return this.templatedUrl && this.templatedUrl.uriParams;
    }
  }, {
    key: "create",
    value: function create(resource, res, rej) {
      if (this.isPersisted) {
        return this.self().create(resource, res, rej);
      }
    }
  }, {
    key: "remove",
    value: function remove(res, rej) {
      if (this.isPersisted) {
        return this.self().remove(res, rej);
      }
    }
  }, {
    key: "update",
    value: function update(res, rej) {
      if (this.isPersisted) {
        return this.self().update(this, res, rej);
      }
    }
  }, {
    key: "load",
    value: function load(res, rej) {
      if (this.isPersisted) {
        return this.self().load(res, rej);
      }
    }
  }, {
    key: "isDirty",
    get: function () {
      return this._dirty;
    }
  }, {
    key: "isPersisted",
    get: function () {
      return this.self && this.self() ? true : false;
    }
  }, {
    key: "_data",

    // XXX used - needs replacement
    //get etag(){
    //  return this._response.restangularEtag;
    //}

    get: function () {
      return this._response["data"];
    }
  }, {
    key: "_links",
    get: function () {
      return this._response["links"];
    }
  }, {
    key: "absorbResponse",
    value: function absorbResponse(response) {
      this._response = response;
    }
  }, {
    key: "setInitialValue",
    value: function setInitialValue(path, value) {

      this.initialValues.push({ path: path, value: value });
    }
  }, {
    key: "initialValues",
    get: function () {
      if (!this.hasOwnProperty("_initialValues")) {
        if (this._initialValues) {
          this._initialValues = this._initialValues.slice(0);
        } else {
          this._initialValues = [];
        }
      }
      return this._initialValues;
    }
  }, {
    key: "emptyData",
    value: function emptyData() {
      var _this = this;

      this._response = { data: {}, links: {} };
      this.initialValues.forEach(function (initialValue) {
        _this.pathBuild(initialValue.path, initialValue.value);
      });
      Object.keys(this.constructor.relationships).forEach(function (relationshipName) {
        var relationshipDescription = _this.constructor.relationships[relationshipName];
        if (relationshipDescription.initializeOnCreate) {
          var relationship = relationshipDescription.initializer.initialize();
          _this.relationships[relationshipName] = relationship;
        }
      });
    }
  }, {
    key: "relationships",
    get: function () {
      this._relationships = this._relationships || {};
      return this._relationships;
    },
    set: function (relationships) {
      this._relationships = relationships;
      return this._relationships;
    }
  }, {
    key: "shortLink",
    get: function () {
      return this.uriParams && this.uriParams[Object.keys(this.uriParams)[0]];
    }
  }, {
    key: "response",
    get: function () {
      return this._response;
    }
  }], [{
    key: "relationships",
    get: function () {
      if (!this.hasOwnProperty("_relationships")) {
        this._relationships = Object.create(this._relationships || {});
      }
      return this._relationships;
    }
  }, {
    key: "description",
    value: function description(resourceDescriptionFactory) {
      var parent = Object.getPrototypeOf(this);
      if (parent !== Resource && parent.description) {
        parent.description(resourceDescriptionFactory);
      }
      if (!this.hasOwnProperty("resourceDescription")) {
        var parentDesc = this.resourceDescription;
        this.resourceDescription = resourceDescriptionFactory();
        if (parentDesc) {
          this.resourceDescription.chainFrom(parentDesc);
        }
      }
      return this.resourceDescription;
    }
  }]);

  return Resource;
})(_DataWrapperJs2["default"]);

exports["default"] = Resource;
module.exports = exports["default"];