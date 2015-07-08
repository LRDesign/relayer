'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var _bind = Function.prototype.bind;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _a1atscript = require('a1atscript');

var SimpleFactory = (function () {
  function SimpleFactory(token) {
    var dependencies = arguments[1] === undefined ? [] : arguments[1];

    _classCallCheck(this, _SimpleFactory);

    this.token = token;
    this.dependencies = dependencies;
  }

  var _SimpleFactory = SimpleFactory;
  SimpleFactory = (0, _a1atscript.ToAnnotation)(SimpleFactory) || SimpleFactory;
  return SimpleFactory;
})();

exports.SimpleFactory = SimpleFactory;

// this converts a class into a factory function which adds depedencies as
// initial parameters to the constructor

var SimpleFactoryInjector = (function () {
  function SimpleFactoryInjector() {
    _classCallCheck(this, SimpleFactoryInjector);
  }

  _createClass(SimpleFactoryInjector, [{
    key: 'annotationClass',
    get: function () {
      return SimpleFactory;
    }
  }, {
    key: 'instantiate',
    value: function instantiate(module, dependencyList) {
      var _this = this;

      dependencyList.forEach(function (dependencyObject) {
        _this.instantiateOne(module, dependencyObject.dependency, dependencyObject.metadata);
      });
    }
  }, {
    key: 'instantiateOne',
    value: function instantiateOne(module, FactoryClass, metadata) {
      var injector = this;
      var factory = function factory() {
        for (var _len = arguments.length, passedDependencies = Array(_len), _key = 0; _key < _len; _key++) {
          passedDependencies[_key] = arguments[_key];
        }

        return function () {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          var newArgs = passedDependencies.concat(args);
          var builtObject = new (_bind.apply(FactoryClass, [null].concat(_toConsumableArray(newArgs))))();
          return builtObject;
        };
      };
      factory['$inject'] = metadata.dependencies;
      module.factory(metadata.token, factory);
    }
  }]);

  return SimpleFactoryInjector;
})();

exports.SimpleFactoryInjector = SimpleFactoryInjector;

(0, _a1atscript.registerInjector)('simpleFactory', SimpleFactoryInjector);