'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Endpoint = (function () {
  function Endpoint() {
    _classCallCheck(this, Endpoint);
  }

  _createClass(Endpoint, [{
    key: 'create',
    value: function create(resource, res, rej) {
      return this.endpointPromise().then(function (endpoint) {
        if (endpoint._create) {
          return endpoint._create(resource);
        } else {
          return endpoint.create(resource);
        }
      }).then(res, rej);
    }
  }, {
    key: 'update',
    value: function update(resource, res, rej) {
      return this.endpointPromise().then(function (endpoint) {
        if (endpoint._update) {
          return endpoint._update(resource);
        } else {
          return endpoint.update(resource);
        }
      }).then(res, rej);
    }
  }, {
    key: 'load',
    value: function load(res, rej) {
      return this.endpointPromise().then(function (endpoint) {
        if (endpoint._load) {
          return endpoint._load();
        } else {
          return endpoint.load();
        }
      }).then(res, rej);
    }
  }, {
    key: 'get',
    value: function get(prop) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return this.load().then(function (response) {
        if (typeof response[prop] == 'function') {
          return response[prop].apply(response, args);
        } else {
          return response[prop];
        }
      });
    }
  }, {
    key: 'remove',
    value: function remove(res, rej) {
      return this.endpointPromise().then(function (endpoint) {
        return endpoint._remove();
      }).then(res, rej);
    }
  }]);

  return Endpoint;
})();

exports['default'] = Endpoint;
module.exports = exports['default'];