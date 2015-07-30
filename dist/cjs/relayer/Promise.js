'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _a1atscript = require('a1atscript');

var RelayerPromise = (function () {
  function RelayerPromise(resolver) {
    _classCallCheck(this, RelayerPromise);

    this.internalPromise = RelayerPromiseFactory.$q(resolver);
  }

  _createClass(RelayerPromise, [{
    key: 'then',
    value: function then(onFulfilled, onRejected, progressBack) {
      return this.internalPromise.then(onFulfilled, onRejected, progressBack);
    }
  }, {
    key: 'catch',
    value: function _catch(callback) {
      return this.internalPromise['catch'](callback);
    }
  }, {
    key: 'finally',
    value: function _finally(callback, progressBack) {
      return this.internalPromise['finally'](callback, progressBack);
    }
  }], [{
    key: 'resolve',
    value: function resolve(value) {
      return new RelayerPromise(function (res, rej) {
        return res(value);
      });
    }
  }, {
    key: 'reject',
    value: function reject(value) {
      return new RelayerPromise(function (res, rej) {
        return rej(value);
      });
    }
  }]);

  return RelayerPromise;
})();

var RelayerPromiseFactory = (function () {
  function RelayerPromiseFactory() {
    _classCallCheck(this, RelayerPromiseFactory);
  }

  _createDecoratedClass(RelayerPromiseFactory, null, [{
    key: 'factory',
    decorators: [(0, _a1atscript.Factory)('RelayerPromise', ['$q'])],
    value: function factory($q) {
      RelayerPromiseFactory.$q = $q;
      return RelayerPromise;
    }
  }]);

  return RelayerPromiseFactory;
})();

exports['default'] = RelayerPromiseFactory;
module.exports = exports['default'];