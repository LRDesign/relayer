define('relayer/jsonpath',[], function() {
  
  if (!Array.isArray) {
    Array.isArray = function(vArg) {
      return Object.prototype.toString.call(vArg) === "[object Array]";
    };
  }
  var cache = {};
  function push(arr, elem) {
    arr = arr.slice();
    arr.push(elem);
    return arr;
  }
  function unshift(elem, arr) {
    arr = arr.slice();
    arr.unshift(elem);
    return arr;
  }
  function jsonPath(obj, expr, arg) {
    var P = {
      resultType: arg && arg.resultType || "value",
      flatten: arg && arg.flatten || false,
      wrap: (arg && arg.hasOwnProperty('wrap')) ? arg.wrap : true,
      sandbox: (arg && arg.sandbox) ? arg.sandbox : {},
      normalize: function(expr) {
        if (cache[expr]) {
          return cache[expr];
        }
        var subx = [];
        var normalized = expr.replace(/[\['](\??\(.*?\))[\]']/g, function($0, $1) {
          return "[#" + (subx.push($1) - 1) + "]";
        }).replace(/'?\.'?|\['?/g, ";").replace(/(;)?(\^+)(;)?/g, function(_, front, ups, back) {
          return ';' + ups.split('').join(';') + ';';
        }).replace(/;;;|;;/g, ";..;").replace(/;$|'?\]|'$/g, "");
        var exprList = normalized.split(';').map(function(expr) {
          var match = expr.match(/#([0-9]+)/);
          return !match || !match[1] ? expr : subx[match[1]];
        });
        cache[expr] = exprList;
        return exprList;
      },
      asPath: function(path) {
        var x = path,
            p = "$";
        for (var i = 1,
            n = x.length; i < n; i++) {
          p += /^[0-9*]+$/.test(x[i]) ? ("[" + x[i] + "]") : ("['" + x[i] + "']");
        }
        return p;
      },
      trace: function(expr, val, path) {
        function addRet(elems) {
          ret = ret.concat(elems);
        }
        if (!expr.length) {
          return [{
            path: path,
            value: val
          }];
        }
        var loc = expr[0],
            x = expr.slice(1);
        if (loc === '^') {
          if (path.length) {
            return [{
              path: path.slice(0, -1),
              expr: x,
              isParentSelector: true
            }];
          } else {
            return [];
          }
        }
        var ret = [];
        if (val && val.hasOwnProperty(loc)) {
          addRet(P.trace(x, val[loc], push(path, loc)));
        } else if (loc === "*") {
          P.walk(loc, x, val, path, function(m, l, x, v, p) {
            addRet(P.trace(unshift(m, x), v, p));
          });
        } else if (loc === "..") {
          addRet(P.trace(x, val, path));
          P.walk(loc, x, val, path, function(m, l, x, v, p) {
            if (typeof v[m] === "object") {
              addRet(P.trace(unshift("..", x), v[m], push(p, m)));
            }
          });
        } else if (loc[0] === '(') {
          addRet(P.trace(unshift(P.evaluate(loc, val, path[path.length], path), x), val, path));
        } else if (loc.indexOf('?(') === 0) {
          P.walk(loc, x, val, path, function(m, l, x, v, p) {
            if (P.evaluate(l.replace(/^\?\((.*?)\)$/, "$1"), v[m], m, path)) {
              addRet(P.trace(unshift(m, x), v, p));
            }
          });
        } else if (loc.indexOf(',') > -1) {
          for (var parts = loc.split(','),
              i = 0; i < parts.length; i++) {
            addRet(P.trace(unshift(parts[i], x), val, path));
          }
        } else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) {
          addRet(P.slice(loc, x, val, path));
        }
        return ret.reduce(function(all, ea) {
          return all.concat(ea.isParentSelector ? P.trace(ea.expr, val, ea.path) : [ea]);
        }, []);
      },
      walk: function(loc, expr, val, path, f) {
        if (Array.isArray(val)) {
          for (var i = 0,
              n = val.length; i < n; i++) {
            f(i, loc, expr, val, path);
          }
        } else if (typeof val === "object") {
          for (var m in val) {
            if (val.hasOwnProperty(m)) {
              f(m, loc, expr, val, path);
            }
          }
        }
      },
      slice: function(loc, expr, val, path) {
        if (!Array.isArray(val)) {
          return ;
        }
        var len = val.length,
            parts = loc.split(':'),
            start = (parts[0] && parseInt(parts[0])) || 0,
            end = (parts[1] && parseInt(parts[1])) || len,
            step = (parts[2] && parseInt(parts[2])) || 1;
        start = (start < 0) ? Math.max(0, start + len) : Math.min(len, start);
        end = (end < 0) ? Math.max(0, end + len) : Math.min(len, end);
        var ret = [];
        for (var i = start; i < end; i += step) {
          ret = ret.concat(P.trace(unshift(i, expr), val, path));
        }
        return ret;
      },
      evaluate: function(code, _v, _vname, path) {
        if (false) {
          if (!$ || !_v) {
            return false;
          }
          if (code.indexOf("@path") > -1) {
            P.sandbox["_path"] = P.asPath(path.concat([_vname]));
            code = code.replace(/@path/g, "_path");
          }
          if (code.indexOf("@") > -1) {
            P.sandbox["_v"] = _v;
            code = code.replace(/@/g, "_v");
          }
          try {
            return vm.runInNewContext(code, P.sandbox);
          } catch (e) {
            console.log(e);
            throw new Error("jsonPath: " + e.message + ": " + code);
          }
        } else {
          var msg = ("Refusing to eval: '" + code + "'");
          console.log(msg);
          throw new Error(("jsonPath: " + msg));
        }
      }
    };
    var $ = obj;
    var resultType = P.resultType.toLowerCase();
    if (obj) {
      if (expr && (resultType == "value" || resultType == "path")) {
        var exprList = P.normalize(expr);
        if (exprList[0] === "$" && exprList.length > 1) {
          exprList.shift();
        }
        var result = P.trace(exprList, obj, ["$"]);
        result = result.filter(function(ea) {
          return ea && !ea.isParentSelector;
        });
        if (!result.length) {
          if (P.wrap) {
            return [];
          } else {
            return false;
          }
        }
        if (result.length === 1 && !P.wrap && (resultType == 'path' || !Array.isArray(result[0].value))) {
          var ret = result[0][resultType];
          if (typeof ret === "undefined") {
            return false;
          } else {
            return ret;
          }
        }
        return result.reduce(function(result, ea) {
          var valOrPath = ea[resultType];
          if (P.flatten && Array.isArray(valOrPath)) {
            result = result.concat(valOrPath);
          } else {
            result.push(valOrPath);
          }
          return result;
        }, []);
      }
    } else {
      return obj;
    }
  }
  var $__default = jsonPath;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('a1atscript/ToAnnotation',[], function() {
  
  function defineAnnotation(target, AnnotationClass, callParams) {
    var oldAnnotation = Object.getOwnPropertyDescriptor(target, 'annotations');
    if (oldAnnotation) {
      var oldGetter = oldAnnotation.get;
      Object.defineProperty(target, 'annotations', {
        configurable: true,
        get: function() {
          var oldValue = oldGetter();
          oldValue.unshift(new (Function.prototype.bind.apply(AnnotationClass, callParams)));
          return oldValue;
        }
      });
    } else {
      Object.defineProperty(target, 'annotations', {
        configurable: true,
        get: function() {
          return [new (Function.prototype.bind.apply(AnnotationClass, callParams))];
        }
      });
    }
  }
  function handleProperty(descriptor, AnnotationClass, callParams) {
    var value;
    if (descriptor.initializer) {
      value = descriptor.initializer();
    } else {
      value = descriptor.value;
    }
    defineAnnotation(value, AnnotationClass, callParams);
    if (descriptor.initializer) {
      descriptor.initializer = function() {
        return value;
      };
    }
    descriptor.enumerable = true;
    return descriptor;
  }
  function ToAnnotation(AnnotationClass) {
    var decorator = function() {
      for (var callParams = [],
          $__0 = 0; $__0 < arguments.length; $__0++)
        callParams[$__0] = arguments[$__0];
      callParams.unshift(null);
      return function(targetClass) {
        for (var otherParams = [],
            $__1 = 1; $__1 < arguments.length; $__1++)
          otherParams[$__1 - 1] = arguments[$__1];
        if (otherParams.length >= 2) {
          return handleProperty(otherParams[1], AnnotationClass, callParams);
        } else {
          defineAnnotation(targetClass, AnnotationClass, callParams);
          return targetClass;
        }
      };
    };
    decorator.originalClass = AnnotationClass;
    return decorator;
  }
  return {
    get ToAnnotation() {
      return ToAnnotation;
    },
    __esModule: true
  };
});

define('a1atscript/annotations',["./ToAnnotation"], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var ToAnnotation = $__0.ToAnnotation;
  var NgAnnotation = function NgAnnotation() {
    for (var dependencies = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      dependencies[$__3] = arguments[$__3];
    this.dependencies = dependencies;
  };
  ($traceurRuntime.createClass)(NgAnnotation, {}, {});
  var NgNamedAnnotation = function NgNamedAnnotation(token) {
    var dependencies = arguments[1] !== (void 0) ? arguments[1] : [];
    this.dependencies = dependencies;
    this.token = token;
  };
  ($traceurRuntime.createClass)(NgNamedAnnotation, {}, {});
  var Config = function Config() {
    $traceurRuntime.superConstructor($Config).apply(this, arguments);
    ;
  };
  var $Config = Config;
  ($traceurRuntime.createClass)(Config, {}, {}, NgAnnotation);
  Object.defineProperty(Config, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  var Run = function Run() {
    $traceurRuntime.superConstructor($Run).apply(this, arguments);
    ;
  };
  var $Run = Run;
  ($traceurRuntime.createClass)(Run, {}, {}, NgAnnotation);
  Object.defineProperty(Run, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  var Controller = function Controller() {
    $traceurRuntime.superConstructor($Controller).apply(this, arguments);
    ;
  };
  var $Controller = Controller;
  ($traceurRuntime.createClass)(Controller, {}, {}, NgNamedAnnotation);
  Object.defineProperty(Controller, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  var Directive = function Directive() {
    $traceurRuntime.superConstructor($Directive).apply(this, arguments);
    ;
  };
  var $Directive = Directive;
  ($traceurRuntime.createClass)(Directive, {}, {}, NgNamedAnnotation);
  Object.defineProperty(Directive, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  var Service = function Service() {
    $traceurRuntime.superConstructor($Service).apply(this, arguments);
    ;
  };
  var $Service = Service;
  ($traceurRuntime.createClass)(Service, {}, {}, NgNamedAnnotation);
  Object.defineProperty(Service, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  var Factory = function Factory() {
    $traceurRuntime.superConstructor($Factory).apply(this, arguments);
    ;
  };
  var $Factory = Factory;
  ($traceurRuntime.createClass)(Factory, {}, {}, NgNamedAnnotation);
  Object.defineProperty(Factory, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  var Provider = function Provider() {
    $traceurRuntime.superConstructor($Provider).apply(this, arguments);
    ;
  };
  var $Provider = Provider;
  ($traceurRuntime.createClass)(Provider, {}, {}, NgNamedAnnotation);
  Object.defineProperty(Provider, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  var Value = function Value() {
    $traceurRuntime.superConstructor($Value).apply(this, arguments);
    ;
  };
  var $Value = Value;
  ($traceurRuntime.createClass)(Value, {}, {}, NgNamedAnnotation);
  Object.defineProperty(Value, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  var Constant = function Constant() {
    $traceurRuntime.superConstructor($Constant).apply(this, arguments);
    ;
  };
  var $Constant = Constant;
  ($traceurRuntime.createClass)(Constant, {}, {}, NgNamedAnnotation);
  Object.defineProperty(Constant, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  var Filter = function Filter() {
    $traceurRuntime.superConstructor($Filter).apply(this, arguments);
    ;
  };
  var $Filter = Filter;
  ($traceurRuntime.createClass)(Filter, {}, {}, NgNamedAnnotation);
  Object.defineProperty(Filter, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  var Animation = function Animation() {
    $traceurRuntime.superConstructor($Animation).apply(this, arguments);
    ;
  };
  var $Animation = Animation;
  ($traceurRuntime.createClass)(Animation, {}, {}, NgNamedAnnotation);
  Object.defineProperty(Animation, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  var Module = function Module() {
    $traceurRuntime.superConstructor($Module).apply(this, arguments);
    ;
  };
  var $Module = Module;
  ($traceurRuntime.createClass)(Module, {}, {}, NgNamedAnnotation);
  var AsModule = function AsModule() {
    $traceurRuntime.superConstructor($AsModule).apply(this, arguments);
    ;
  };
  var $AsModule = AsModule;
  ($traceurRuntime.createClass)(AsModule, {}, {}, Module);
  Object.defineProperty(AsModule, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  return {
    get Config() {
      return Config;
    },
    get Run() {
      return Run;
    },
    get Controller() {
      return Controller;
    },
    get Directive() {
      return Directive;
    },
    get Service() {
      return Service;
    },
    get Factory() {
      return Factory;
    },
    get Provider() {
      return Provider;
    },
    get Value() {
      return Value;
    },
    get Constant() {
      return Constant;
    },
    get Filter() {
      return Filter;
    },
    get Animation() {
      return Animation;
    },
    get Module() {
      return Module;
    },
    get AsModule() {
      return AsModule;
    },
    __esModule: true
  };
});

define('a1atscript/AnnotationFinder',[], function() {
  
  var AnnotationFinder = function AnnotationFinder(AnnotatedClass) {
    this.AnnotatedClass = AnnotatedClass;
  };
  ($traceurRuntime.createClass)(AnnotationFinder, {
    annotationFor: function(AnnotationClass) {
      var OriginalClass = AnnotationClass.originalClass || AnnotationClass;
      if (this.AnnotatedClass.annotations) {
        return this.AnnotatedClass.annotations.find((function(annotation) {
          return annotation instanceof OriginalClass;
        }));
      } else {
        return null;
      }
    },
    annotationsFor: function(AnnotationClass) {
      var OriginalClass = AnnotationClass.originalClass || AnnotationClass;
      if (this.AnnotatedClass.annotations) {
        return this.AnnotatedClass.annotations.filter((function(annotation) {
          return annotation instanceof OriginalClass;
        }));
      } else {
        return null;
      }
    }
  }, {});
  return {
    get AnnotationFinder() {
      return AnnotationFinder;
    },
    __esModule: true
  };
});

define('a1atscript/ng2Directives/Ng2Directive',[], function() {
  
  var Ng2Directive = function Ng2Directive(descriptor) {
    this.selector = descriptor.selector;
    this.properties = descriptor.properties || descriptor.bind;
    this.controllerAs = descriptor.controllerAs;
    this.require = descriptor.require;
    this.transclude = descriptor.transclude;
    this.events = descriptor.events;
  };
  ($traceurRuntime.createClass)(Ng2Directive, {}, {});
  var $__default = Ng2Directive;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('a1atscript/ng2Directives/Component',["./Ng2Directive", "../ToAnnotation"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Ng2Directive = $__0.default;
  var ToAnnotation = $__2.ToAnnotation;
  var Component = function Component(descriptor) {
    $traceurRuntime.superConstructor($Component).call(this, descriptor);
    this.injectables = descriptor.injectables || descriptor.services;
  };
  var $Component = Component;
  ($traceurRuntime.createClass)(Component, {}, {}, Ng2Directive);
  Object.defineProperty(Component, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  var ViewBase = function ViewBase(descriptor) {
    this.templateUrl = descriptor.templateUrl || descriptor.url;
    this.template = descriptor.template || descriptor.inline;
  };
  ($traceurRuntime.createClass)(ViewBase, {}, {});
  var Template = function Template() {
    $traceurRuntime.superConstructor($Template).apply(this, arguments);
    ;
  };
  var $Template = Template;
  ($traceurRuntime.createClass)(Template, {}, {}, ViewBase);
  Object.defineProperty(Template, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  var View = function View() {
    $traceurRuntime.superConstructor($View).apply(this, arguments);
    ;
  };
  var $View = View;
  ($traceurRuntime.createClass)(View, {}, {}, ViewBase);
  Object.defineProperty(View, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  return {
    get Component() {
      return Component;
    },
    get ViewBase() {
      return ViewBase;
    },
    get Template() {
      return Template;
    },
    get View() {
      return View;
    },
    __esModule: true
  };
});

define('a1atscript/ng2Directives/SelectorMatcher',[], function() {
  
  var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
  var MOZ_HACK_REGEXP = /^moz([A-Z])/;
  var SelectorMatcher = function SelectorMatcher(selector) {
    this._selector = selector;
  };
  ($traceurRuntime.createClass)(SelectorMatcher, {
    _camelizeName: function() {
      this._name = this._name.replace(SPECIAL_CHARS_REGEXP, (function(_, separator, letter, offset) {
        return offset ? letter.toUpperCase() : letter;
      })).replace(MOZ_HACK_REGEXP, 'Moz$1');
    },
    _split: function() {
      if (this._selector[0] == ".") {
        this._restrict = "C";
        this._name = this._selector.substring(1);
      } else if (this._selector[0] == "[" && this._selector[this._selector.length - 1] == "]") {
        this._restrict = "A";
        this._name = this._selector.substring(1, this._selector.length - 1);
      } else {
        this._restrict = "E";
        this._name = this._selector;
      }
    },
    get name() {
      if (!this._name) {
        this._split();
      }
      this._camelizeName();
      return this._name;
    },
    get restrict() {
      if (!this._restrict) {
        this._split();
      }
      return this._restrict;
    }
  }, {});
  var $__default = SelectorMatcher;
  Object.defineProperty(SelectorMatcher, "parameters", {get: function() {
      return [[$traceurRuntime.type.string]];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('a1atscript/router/ComponentMapper',["../annotations", "../ng2Directives/Component", "../AnnotationFinder", "../ng2Directives/SelectorMatcher"], function($__0,$__2,$__4,$__6) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  var Controller = $__0.Controller;
  var $__3 = $__2,
      Component = $__3.Component,
      ViewBase = $__3.ViewBase;
  var AnnotationFinder = $__4.AnnotationFinder;
  var SelectorMatcher = $__6.default;
  var DEFAULT_CONTROLLER_SUFFIX = "Controller";
  var DEFAULT_COMPONENT_PREFIX = "a1atscript";
  var DEFAULT_CONTROLLER_PREFIX = "A1AtScript";
  var ComponentMapping = function ComponentMapping(component, componentMapper) {
    this.component = component;
    this.componentMapper = componentMapper;
  };
  ($traceurRuntime.createClass)(ComponentMapping, {
    get componentName() {
      return this.componentMapper.map.get(this.component);
    },
    get templateUrl() {
      return this.componentMapper.registry[this.componentName].templateUrl;
    },
    get isController() {
      return this.componentMapper.registry[this.componentName].isController;
    },
    get controllerName() {
      return this.componentMapper.registry[this.componentName].controllerName;
    }
  }, {});
  var ComponentMapper = function ComponentMapper() {
    ;
  };
  ($traceurRuntime.createClass)(ComponentMapper, {
    register: function(component) {
      if (!this.map.get(component)) {
        this._setupComponent(component);
      }
      return new ComponentMapping(component, this);
    },
    _getControllerComponentName: function(component) {
      var name = this._getControllerName(component);
      if (name) {
        if (name.endsWith(DEFAULT_CONTROLLER_SUFFIX)) {
          return name[0].toLowerCase() + name.substr(1, name.length - DEFAULT_CONTROLLER_SUFFIX.length - 1);
        } else {
          return name[0].toLowerCase() + name.substr(1, name.length - 1);
        }
      } else {
        return null;
      }
    },
    _getControllerName: function(component) {
      var controllerAnnotation = (new AnnotationFinder(component)).annotationFor(Controller);
      if (controllerAnnotation) {
        return controllerAnnotation.token;
      } else {
        return null;
      }
    },
    _isController: function(component) {
      var controllerAnnotation = (new AnnotationFinder(component)).annotationFor(Controller);
      if (controllerAnnotation) {
        return true;
      } else {
        return false;
      }
    },
    _getComponentName: function(component) {
      var componentAnnotation = (new AnnotationFinder(component)).annotationFor(Component);
      if (componentAnnotation) {
        if (componentAnnotation.controllerAs) {
          return componentAnnotation.controllerAs;
        } else if (componentAnnotation.selector) {
          var selectorMatcher = new SelectorMatcher(componentAnnotation.selector);
          return selectorMatcher.name;
        } else {
          return null;
        }
      } else {
        return null;
      }
    },
    _getGeneratedName: function() {
      this._componentIndex = this._componentIndex || 0;
      var name = (DEFAULT_COMPONENT_PREFIX + "Component_" + this._componentIndex);
      this._componentIndex = this._componentIndex + 1;
      return name;
    },
    _generateName: function(component) {
      var name = this._getControllerComponentName(component);
      name = name || this._getComponentName(component);
      name = name || this._getGeneratedName();
      return name;
    },
    _generateTemplate: function(name, component) {
      var viewAnnotation = (new AnnotationFinder(component)).annotationFor(ViewBase);
      if (viewAnnotation && viewAnnotation.templateUrl) {
        return viewAnnotation.templateUrl;
      } else {
        return ("./components/" + name + "/" + name + ".html");
      }
    },
    _readInlineTemplate: function(templateUrl, component) {
      var viewAnnotation = (new AnnotationFinder(component)).annotationFor(ViewBase);
      if (viewAnnotation && viewAnnotation.template) {
        this.inlineTemplateCache[templateUrl] = viewAnnotation.template;
      }
    },
    _generateControllerName: function(name) {
      var componentBase;
      if (name.startsWith(DEFAULT_COMPONENT_PREFIX)) {
        componentBase = name.substring(DEFAULT_COMPONENT_PREFIX.length, name.length);
      } else {
        componentBase = name;
      }
      return DEFAULT_CONTROLLER_PREFIX + componentBase[0].toUpperCase() + componentBase.substring(1, componentBase.length) + DEFAULT_CONTROLLER_SUFFIX;
    },
    _setupComponent: function(component) {
      var name = this._generateName(component);
      var templateUrl = this._generateTemplate(name, component);
      var controllerName = this._getControllerName(component);
      var isController;
      if (controllerName) {
        isController = true;
      } else {
        isController = false;
        controllerName = this._generateControllerName(name);
      }
      this.map.set(component, name);
      this.registry[name] = {
        component: component,
        templateUrl: templateUrl,
        isController: isController,
        controllerName: controllerName
      };
      this.controllerRegistry[controllerName] = name;
      this._readInlineTemplate(templateUrl, component);
    },
    get registry() {
      this._componentRegistry = this._componentRegistry || {};
      return this._componentRegistry;
    },
    get map() {
      this._componentMap = this._componentMap || new Map();
      return this._componentMap;
    },
    getComponent: function(componentName) {
      return this.registry[componentName].component;
    },
    getTemplateUrl: function(componentName) {
      return this.registry[componentName].templateUrl;
    },
    getComponentName: function(component) {
      return this.map.get(component);
    },
    get controllerRegistry() {
      this._controllerRegistry = this._controllerRegistry || {};
      return this._controllerRegistry;
    },
    get inlineTemplateCache() {
      this._inlineTemplateCache = this._inlineTemplateCache || {};
      return this._inlineTemplateCache;
    }
  }, {});
  return {
    get ComponentMapper() {
      return ComponentMapper;
    },
    __esModule: true
  };
});

define('a1atscript/router/RouteConfig',["../ToAnnotation"], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var ToAnnotation = $__0.ToAnnotation;
  var RouteConfig = function RouteConfig(routeDescription) {
    this.routeDescription = routeDescription;
  };
  ($traceurRuntime.createClass)(RouteConfig, {}, {});
  Object.defineProperty(RouteConfig, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  return {
    get RouteConfig() {
      return RouteConfig;
    },
    __esModule: true
  };
});

define('a1atscript/router/RouteReader',["./RouteConfig", "../AnnotationFinder"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var RouteConfig = $__0.RouteConfig;
  var AnnotationFinder = $__2.AnnotationFinder;
  var RouteReader = function RouteReader(componentMapper) {
    this.componentMapper = componentMapper;
  };
  ($traceurRuntime.createClass)(RouteReader, {
    _routeConfigAnnotations: function(component) {
      return (new AnnotationFinder(component)).annotationsFor(RouteConfig);
    },
    _routeConfig: function(component) {
      return this._routeConfigAnnotations(component).map(this._convertConfig.bind(this));
    },
    _componentName: function(component) {
      if (typeof(component) === "string") {
        return component;
      } else {
        return this.componentMapper.register(component).componentName;
      }
    },
    _convertConfig: function(routeConfigAnnotation) {
      var $__4 = this;
      var routeDescription = Object.assign({}, routeConfigAnnotation.routeDescription);
      if (routeDescription.component) {
        routeDescription.component = this._componentName(routeDescription.component);
      }
      if (routeDescription.components) {
        var components = {};
        Object.keys(routeDescription.components).forEach((function(key) {
          components[key] = $__4._componentName(routeDescription.components[key]);
        }));
        routeDescription.components = components;
      }
      return routeDescription;
    },
    read: function(component) {
      var mapping = this.componentMapper.register(component);
      component.$routeConfig = this._routeConfig(component);
    }
  }, {});
  return {
    get RouteReader() {
      return RouteReader;
    },
    __esModule: true
  };
});

define('a1atscript/router/RouteInitializer',[], function() {
  
  var RouteInitializer = function RouteInitializer(componentMapper) {
    this.componentMapper = componentMapper;
  };
  ($traceurRuntime.createClass)(RouteInitializer, {
    configurationFunction: function(componentMapperName) {
      var componentMapper = this.componentMapper;
      return function($injector) {
        var $componentMapper;
        try {
          $componentMapper = $injector.get(componentMapperName);
        } catch (e) {
          return ;
        }
        $componentMapper.setCtrlNameMapping(function(name) {
          return componentMapper.registry[name].controllerName;
        });
        $componentMapper.setTemplateMapping(function(name) {
          return componentMapper.registry[name].templateUrl;
        });
        $componentMapper.setComponentFromCtrlMapping(function(controllerName) {
          return componentMapper.controllerRegistry[controllerName];
        });
      };
    },
    topRouteConfig: function(routerName, routeConfig) {
      return function($injector) {
        var $router;
        try {
          $router = $injector.get(routerName);
        } catch (e) {
          return ;
        }
        $router.config(routeConfig);
      };
    },
    setupComponentControllers: function() {
      var $__0 = this;
      Object.keys(this.componentMapper.registry).forEach((function(component) {
        var config = $__0.componentMapper.registry[component];
        if (!config.isController && config.component != $__0.topComponent) {
          $__0.module.controller(config.controllerName, config.component);
        }
      }));
    },
    setupInlineTemplates: function() {
      var inlineTemplateCache = this.componentMapper.inlineTemplateCache;
      return function($templateCache) {
        Object.keys(inlineTemplateCache).forEach((function(templateUrl) {
          $templateCache.put(templateUrl, inlineTemplateCache[templateUrl]);
        }));
      };
    },
    initialize: function(ngModuleName) {
      var topComponent = arguments[1] !== (void 0) ? arguments[1] : null;
      this.module = angular.module(ngModuleName);
      this.module.config(['$injector', this.configurationFunction('$componentLoaderProvider')]);
      this.module.run(['$injector', this.configurationFunction('$componentMapper')]);
      if (topComponent && topComponent.$routeConfig) {
        this.topComponent = topComponent;
        this.module.run(['$injector', this.topRouteConfig('$router', topComponent.$routeConfig)]);
      }
      this.setupComponentControllers();
      this.module.run(['$templateCache', this.setupInlineTemplates()]);
    }
  }, {});
  return {
    get RouteInitializer() {
      return RouteInitializer;
    },
    __esModule: true
  };
});

define('a1atscript/Router',["./router/ComponentMapper", "./router/RouteReader", "./router/RouteInitializer", "./router/RouteConfig"], function($__0,$__2,$__4,$__6) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  var ComponentMapper = $__0.ComponentMapper;
  var RouteReader = $__2.RouteReader;
  var RouteInitializer = $__4.RouteInitializer;
  var $__router_47_RouteConfig_46_js__ = $__6;
  var componentMapper = new ComponentMapper();
  var routeReader = new RouteReader(componentMapper);
  var routeInitializer = new RouteInitializer(componentMapper);
  var Router = {
    componentMapper: componentMapper,
    routeReader: routeReader,
    routeInitializer: routeInitializer
  };
  return {
    get RouteConfig() {
      return $__router_47_RouteConfig_46_js__.RouteConfig;
    },
    get Router() {
      return Router;
    },
    __esModule: true
  };
});

define('a1atscript/injectorTypes',["./annotations", "./Router"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var $__1 = $__0,
      Config = $__1.Config,
      Run = $__1.Run,
      Controller = $__1.Controller,
      Directive = $__1.Directive,
      Service = $__1.Service,
      Factory = $__1.Factory,
      Provider = $__1.Provider,
      Value = $__1.Value,
      Constant = $__1.Constant,
      Animation = $__1.Animation,
      Filter = $__1.Filter;
  var Router = $__2.Router;
  var ListInjector = function ListInjector() {
    ;
  };
  ($traceurRuntime.createClass)(ListInjector, {instantiate: function(module, dependencyList) {
      var $__4 = this;
      dependencyList.forEach((function(dependencyObject) {
        $__4.instantiateOne(module, dependencyObject.dependency, dependencyObject.metadata);
      }));
    }}, {});
  var ConfigInjector = function ConfigInjector() {
    $traceurRuntime.superConstructor($ConfigInjector).apply(this, arguments);
    ;
  };
  var $ConfigInjector = ConfigInjector;
  ($traceurRuntime.createClass)(ConfigInjector, {
    get annotationClass() {
      return Config;
    },
    instantiateOne: function(module, config, metadata) {
      config['$inject'] = metadata.dependencies;
      module.config(config);
    }
  }, {}, ListInjector);
  var RunInjector = function RunInjector() {
    $traceurRuntime.superConstructor($RunInjector).apply(this, arguments);
    ;
  };
  var $RunInjector = RunInjector;
  ($traceurRuntime.createClass)(RunInjector, {
    get annotationClass() {
      return Run;
    },
    instantiateOne: function(module, run, metadata) {
      run['$inject'] = metadata.dependencies;
      module.run(run);
    }
  }, {}, ListInjector);
  var ControllerInjector = function ControllerInjector() {
    $traceurRuntime.superConstructor($ControllerInjector).apply(this, arguments);
    ;
  };
  var $ControllerInjector = ControllerInjector;
  ($traceurRuntime.createClass)(ControllerInjector, {
    get annotationClass() {
      return Controller;
    },
    instantiateOne: function(module, controller, metadata) {
      controller['$inject'] = metadata.dependencies;
      Router.routeReader.read(controller);
      module.controller(metadata.token, controller);
    }
  }, {}, ListInjector);
  var DirectiveInjector = function DirectiveInjector() {
    $traceurRuntime.superConstructor($DirectiveInjector).apply(this, arguments);
    ;
  };
  var $DirectiveInjector = DirectiveInjector;
  ($traceurRuntime.createClass)(DirectiveInjector, {
    get annotationClass() {
      return Directive;
    },
    instantiateOne: function(module, directive, metadata) {
      directive['$inject'] = metadata.dependencies;
      module.directive(metadata.token, directive);
    }
  }, {}, ListInjector);
  var ServiceInjector = function ServiceInjector() {
    $traceurRuntime.superConstructor($ServiceInjector).apply(this, arguments);
    ;
  };
  var $ServiceInjector = ServiceInjector;
  ($traceurRuntime.createClass)(ServiceInjector, {
    get annotationClass() {
      return Service;
    },
    instantiateOne: function(module, service, metadata) {
      service['$inject'] = metadata.dependencies;
      module.service(metadata.token, service);
    }
  }, {}, ListInjector);
  var FactoryInjector = function FactoryInjector() {
    $traceurRuntime.superConstructor($FactoryInjector).apply(this, arguments);
    ;
  };
  var $FactoryInjector = FactoryInjector;
  ($traceurRuntime.createClass)(FactoryInjector, {
    get annotationClass() {
      return Factory;
    },
    instantiateOne: function(module, factory, metadata) {
      factory['$inject'] = metadata.dependencies;
      module.factory(metadata.token, factory);
    }
  }, {}, ListInjector);
  var ProviderInjector = function ProviderInjector() {
    $traceurRuntime.superConstructor($ProviderInjector).apply(this, arguments);
    ;
  };
  var $ProviderInjector = ProviderInjector;
  ($traceurRuntime.createClass)(ProviderInjector, {
    get annotationClass() {
      return Provider;
    },
    instantiateOne: function(module, provider, metadata) {
      provider['$inject'] = metadata.dependencies;
      module.provider(metadata.token, provider);
    }
  }, {}, ListInjector);
  var ValueInjector = function ValueInjector() {
    $traceurRuntime.superConstructor($ValueInjector).apply(this, arguments);
    ;
  };
  var $ValueInjector = ValueInjector;
  ($traceurRuntime.createClass)(ValueInjector, {
    get annotationClass() {
      return Value;
    },
    instantiateOne: function(module, value, metadata) {
      value['$inject'] = metadata.dependencies;
      module.value(metadata.token, value);
    }
  }, {}, ListInjector);
  var ConstantInjector = function ConstantInjector() {
    $traceurRuntime.superConstructor($ConstantInjector).apply(this, arguments);
    ;
  };
  var $ConstantInjector = ConstantInjector;
  ($traceurRuntime.createClass)(ConstantInjector, {
    get annotationClass() {
      return Constant;
    },
    instantiateOne: function(module, constant, metadata) {
      constant['$inject'] = metadata.dependencies;
      module.constant(metadata.token, constant);
    }
  }, {}, ListInjector);
  var AnimationInjector = function AnimationInjector() {
    $traceurRuntime.superConstructor($AnimationInjector).apply(this, arguments);
    ;
  };
  var $AnimationInjector = AnimationInjector;
  ($traceurRuntime.createClass)(AnimationInjector, {
    get annotationClass() {
      return Animation;
    },
    instantiateOne: function(module, animation, metadata) {
      animation['$inject'] = metadata.dependencies;
      module.animation(metadata.token, animation);
    }
  }, {}, ListInjector);
  var FilterInjector = function FilterInjector() {
    $traceurRuntime.superConstructor($FilterInjector).apply(this, arguments);
    ;
  };
  var $FilterInjector = FilterInjector;
  ($traceurRuntime.createClass)(FilterInjector, {
    get annotationClass() {
      return Filter;
    },
    instantiateOne: function(module, filter, metadata) {
      filter['$inject'] = metadata.dependencies;
      module.filter(metadata.token, filter);
    }
  }, {}, ListInjector);
  return {
    get ListInjector() {
      return ListInjector;
    },
    get ConfigInjector() {
      return ConfigInjector;
    },
    get RunInjector() {
      return RunInjector;
    },
    get ControllerInjector() {
      return ControllerInjector;
    },
    get DirectiveInjector() {
      return DirectiveInjector;
    },
    get ServiceInjector() {
      return ServiceInjector;
    },
    get FactoryInjector() {
      return FactoryInjector;
    },
    get ProviderInjector() {
      return ProviderInjector;
    },
    get ValueInjector() {
      return ValueInjector;
    },
    get ConstantInjector() {
      return ConstantInjector;
    },
    get AnimationInjector() {
      return AnimationInjector;
    },
    get FilterInjector() {
      return FilterInjector;
    },
    __esModule: true
  };
});

define('a1atscript/Injector',["./annotations", "./AnnotationFinder", "./injectorTypes"], function($__0,$__2,$__4) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var $__1 = $__0,
      AsModule = $__1.AsModule,
      Module = $__1.Module;
  var AnnotationFinder = $__2.AnnotationFinder;
  var $__5 = $__4,
      ConfigInjector = $__5.ConfigInjector,
      RunInjector = $__5.RunInjector,
      ControllerInjector = $__5.ControllerInjector,
      DirectiveInjector = $__5.DirectiveInjector,
      ServiceInjector = $__5.ServiceInjector,
      FactoryInjector = $__5.FactoryInjector,
      ProviderInjector = $__5.ProviderInjector,
      ValueInjector = $__5.ValueInjector,
      ConstantInjector = $__5.ConstantInjector,
      AnimationInjector = $__5.AnimationInjector,
      FilterInjector = $__5.FilterInjector;
  var registeredInjectors = {};
  function registerInjector(name, InjectorClass) {
    registeredInjectors[name] = new InjectorClass();
  }
  function getInjector(name) {
    return registeredInjectors[name];
  }
  registerInjector('config', ConfigInjector);
  registerInjector('run', RunInjector);
  registerInjector('controller', ControllerInjector);
  registerInjector('directive', DirectiveInjector);
  registerInjector('service', ServiceInjector);
  registerInjector('factory', FactoryInjector);
  registerInjector('provider', ProviderInjector);
  registerInjector('value', ValueInjector);
  registerInjector('constant', ConstantInjector);
  registerInjector('animation', AnimationInjector);
  registerInjector('filter', FilterInjector);
  var Injector = function Injector() {
    var appNamePrefix = arguments[0] !== (void 0) ? arguments[0] : "";
    this.appNamePrefix = appNamePrefix;
    this.injectedModules = {};
  };
  ($traceurRuntime.createClass)(Injector, {
    get annotationClass() {
      return Module;
    },
    instantiate: function(moduleClass) {
      var metadata = this._getAnnotatedClass(moduleClass);
      if (!metadata) {
        return undefined;
      }
      if (this.injectedModules[metadata.token]) {
        return this.injectedModules[metadata.token];
      }
      var sortedDependencies = this._sortModuleDependencies(metadata);
      sortedDependencies = this._sortSelf(metadata, moduleClass, sortedDependencies);
      var moduleDependencies = this._instantiateModuleDependencies(sortedDependencies.module);
      var moduleName = metadata.token;
      if (this.appNamePrefix && moduleName != this.appNamePrefix) {
        moduleName = (this.appNamePrefix + "." + moduleName);
      }
      var instantiatedModule = angular.module(moduleName, moduleDependencies);
      delete sortedDependencies.module;
      this._instantiateOtherDependencies(sortedDependencies, instantiatedModule);
      this.injectedModules[metadata.token] = moduleName;
      return moduleName;
    },
    _sortSelf: function(metadata, moduleClass, sortedDependencies) {
      if (metadata == moduleClass) {
        return sortedDependencies;
      } else {
        var selfDependency = this._sortDependency(moduleClass, false);
        return this._mergeSortedDependencies(sortedDependencies, selfDependency);
      }
    },
    _getAnnotatedClass: function(moduleClass) {
      if (moduleClass instanceof Module) {
        moduleClass.injectable = false;
        return moduleClass;
      } else {
        var metadata = this._getModuleAnnotation(moduleClass);
        return metadata;
      }
    },
    _getDependencyType: function(dependency) {
      var annotations = dependency.annotations;
      for (var i = 0; i < annotations.length; i++) {
        var annotation = annotations[i];
        var foundInjector = Object.keys(registeredInjectors).find((function(key) {
          var annotationClass = registeredInjectors[key].annotationClass;
          annotationClass = annotationClass.originalClass || annotationClass;
          return annotation instanceof annotationClass;
        }));
        if (foundInjector) {
          return {
            key: foundInjector,
            metadata: annotation
          };
        }
      }
      return null;
    },
    _getModuleAnnotation: function(dependency) {
      return (new AnnotationFinder(dependency)).annotationFor(Module);
    },
    _mergeSortedDependencies: function(sorted1, sorted2) {
      var newSorted = {};
      Object.assign(newSorted, sorted1);
      Object.keys(sorted2).forEach((function(key) {
        if (newSorted[key]) {
          newSorted[key] = newSorted[key].concat(sorted2[key]);
        } else {
          newSorted[key] = sorted2[key];
        }
      }));
      return newSorted;
    },
    _sortDependency: function(dependency) {
      var checkModule = arguments[1] !== (void 0) ? arguments[1] : true;
      var $__6 = this;
      var sorted = {};
      if (typeof dependency === "string" || dependency instanceof Module) {
        sorted.module = [dependency];
      } else if (dependency.annotations) {
        if (checkModule && this._getModuleAnnotation(dependency)) {
          sorted.module = [dependency];
        } else {
          var dependencyType = this._getDependencyType(dependency);
          if (dependencyType) {
            sorted[dependencyType.key] = [{
              dependency: dependency,
              metadata: dependencyType.metadata
            }];
          }
        }
      } else {
        Object.keys(dependency).forEach((function(key) {
          var subDependency = dependency[key];
          var sortedSubDependencies = $__6._sortDependency(subDependency);
          sorted = $__6._mergeSortedDependencies(sorted, sortedSubDependencies);
        }));
      }
      return sorted;
    },
    _sortModuleDependencies: function(moduleClass) {
      var $__6 = this;
      var sorted = {};
      moduleClass.dependencies.forEach((function(dependency) {
        var newSortedDependencies = $__6._sortDependency(dependency);
        sorted = $__6._mergeSortedDependencies(sorted, newSortedDependencies);
      }));
      return sorted;
    },
    _moduleMetadata: function(moduleClass) {
      return moduleClass.annotations.find((function(value) {
        return value instanceof Module || value instanceof AsModule;
      }));
    },
    _instantiateModuleDependencies: function(moduleDependencies) {
      var $__6 = this;
      var returnedDependencies = [];
      if (moduleDependencies) {
        moduleDependencies.forEach((function(moduleDependency) {
          if (typeof moduleDependency === "string") {
            returnedDependencies.push(moduleDependency);
          } else {
            returnedDependencies.push($__6.instantiate(moduleDependency));
          }
        }));
      }
      return returnedDependencies;
    },
    _instantiateOtherDependencies: function(sortedDependencies, instantiatedModule) {
      Object.keys(sortedDependencies).forEach((function(dependencyType) {
        registeredInjectors[dependencyType].instantiate(instantiatedModule, sortedDependencies[dependencyType]);
      }));
    }
  }, {});
  return {
    get registerInjector() {
      return registerInjector;
    },
    get getInjector() {
      return getInjector;
    },
    get Injector() {
      return Injector;
    },
    __esModule: true
  };
});

define('a1atscript/DirectiveObject',["./injectorTypes", "./Injector", "./ToAnnotation"], function($__0,$__2,$__4) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var ListInjector = $__0.ListInjector;
  var registerInjector = $__2.registerInjector;
  var ToAnnotation = $__4.ToAnnotation;
  var DirectiveObject = function DirectiveObject(token) {
    var dependencies = arguments[1] !== (void 0) ? arguments[1] : [];
    this.dependencies = dependencies;
    this.token = token;
  };
  ($traceurRuntime.createClass)(DirectiveObject, {}, {});
  Object.defineProperty(DirectiveObject, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  var DirectiveObjectInjector = function DirectiveObjectInjector() {
    $traceurRuntime.superConstructor($DirectiveObjectInjector).apply(this, arguments);
    ;
  };
  var $DirectiveObjectInjector = DirectiveObjectInjector;
  ($traceurRuntime.createClass)(DirectiveObjectInjector, {
    get annotationClass() {
      return DirectiveObject;
    },
    _createFactoryArray: function(ConstructorFn) {
      var args = ConstructorFn.$inject || [];
      var factoryArray = args.slice();
      factoryArray.push((function() {
        for (var args = [],
            $__7 = 0; $__7 < arguments.length; $__7++)
          args[$__7] = arguments[$__7];
        var directive = new (Function.prototype.bind.apply(ConstructorFn, $traceurRuntime.spread([null], args)))();
        for (var key in directive) {
          directive[key] = directive[key];
        }
        return directive;
      }));
      return factoryArray;
    },
    _cloneFunction: function(original) {
      return function() {
        return original.apply(this, arguments);
      };
    },
    _override: function(object, methodName, callback) {
      object[methodName] = callback(object[methodName]);
    },
    instantiateOne: function(module, directiveObject, metadata) {
      directiveObject['$inject'] = metadata.dependencies;
      if (!directiveObject.prototype.compile) {
        directiveObject.prototype.compile = (function() {});
      }
      var originalCompileFn = this._cloneFunction(directiveObject.prototype.compile);
      this._override(directiveObject.prototype, 'compile', function() {
        return function() {
          originalCompileFn.apply(this, arguments);
          if (directiveObject.prototype.link) {
            return directiveObject.prototype.link.bind(this);
          }
        };
      });
      var factoryArray = this._createFactoryArray(directiveObject);
      module.directive(metadata.token, factoryArray);
    }
  }, {}, ListInjector);
  registerInjector('directiveObject', DirectiveObjectInjector);
  return {
    get DirectiveObject() {
      return DirectiveObject;
    },
    __esModule: true
  };
});

define('a1atscript/ng2Directives/Ng2DirectiveDefinitionObject',["./SelectorMatcher"], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var SelectorMatcher = $__0.default;
  var Ng2DirectiveDefinitionObject = function Ng2DirectiveDefinitionObject(controller, annotation) {
    var template = arguments[2] !== (void 0) ? arguments[2] : {};
    var bind = arguments[3] !== (void 0) ? arguments[3] : null;
    this._annotation = annotation;
    this._controller = controller;
    this._template = template;
    this._bind = bind;
  };
  ($traceurRuntime.createClass)(Ng2DirectiveDefinitionObject, {
    get selectorMatcher() {
      this._selectorMatcher = this._selectorMatcher || new SelectorMatcher(this._annotation.selector);
      return this._selectorMatcher;
    },
    get restrict() {
      return this.selectorMatcher.restrict;
    },
    get controllerAs() {
      return this._annotation.controllerAs || this.name;
    },
    get bindToController() {
      if (angular.version.major == 1 && angular.version.minor >= 4) {
        return this._bind || this._annotation.properties;
      } else {
        return true;
      }
    },
    get scope() {
      if (angular.version.major == 1 && angular.version.minor >= 4) {
        return {};
      } else {
        return this._bind || this._annotation.properties;
      }
    },
    get template() {
      return this._template.template;
    },
    get templateUrl() {
      return this._template.templateUrl;
    },
    get transclude() {
      return this._annotation.transclude;
    },
    get require() {
      return this._annotation.require;
    },
    get controller() {
      return this._controller;
    },
    get name() {
      return this.selectorMatcher.name;
    },
    get factoryFn() {
      var $__2 = this;
      return (function() {
        return {
          scope: $__2.scope,
          restrict: $__2.restrict,
          template: $__2.template,
          require: $__2.require,
          transclude: $__2.transclude,
          templateUrl: $__2.templateUrl,
          controller: $__2.controller,
          bindToController: $__2.bindToController,
          controllerAs: $__2.controllerAs
        };
      });
    }
  }, {});
  var $__default = Ng2DirectiveDefinitionObject;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('a1atscript/ng2Directives/BindBuilder',[], function() {
  
  var BindBuilder = function BindBuilder(bindObj, component) {
    this._bindObj = bindObj;
    this._component = component;
  };
  ($traceurRuntime.createClass)(BindBuilder, {build: function() {
      var $__0 = this;
      var properties = {};
      Object.keys(this._bindObj).forEach((function(key) {
        $__0.setupProperty(key, properties);
      }));
      return properties;
    }}, {});
  var $__default = BindBuilder;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('a1atscript/ng2Directives/PropertiesBuilder',["./BindBuilder"], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var BindBuilder = $__0.default;
  var BIND_PREFIX = "_=_";
  var STRING_PREFIX = "_@_";
  var BINDING = BIND_PREFIX;
  var RAW_STRING = STRING_PREFIX;
  var PropertiesBuilder = function PropertiesBuilder() {
    $traceurRuntime.superConstructor($PropertiesBuilder).apply(this, arguments);
    ;
  };
  var $PropertiesBuilder = PropertiesBuilder;
  ($traceurRuntime.createClass)(PropertiesBuilder, {setupProperty: function(key, properties) {
      properties[STRING_PREFIX + key] = "@" + this._bindObj[key];
      properties[BIND_PREFIX + key] = "=?bind" + this._bindObj[key][0].toUpperCase() + this._bindObj[key].slice(1);
      Object.defineProperty(this._component.prototype, BIND_PREFIX + key, {
        enumerable: true,
        configurable: true,
        set: genericSetter(BINDING, RAW_STRING),
        get: function() {
          return this[key];
        }
      });
      Object.defineProperty(this._component.prototype, STRING_PREFIX + key, {
        enumerable: true,
        configurable: true,
        set: genericSetter(RAW_STRING, BINDING),
        get: function() {
          return this[key];
        }
      });
      function genericSetter(use, errorOn) {
        return function(value) {
          this.__using_binding__ = this.__using_binding__ || {};
          if (this.__using_binding__[key] === errorOn) {
            if (value !== undefined) {
              throw new Error(("Cannot use bind-" + key + " and " + key + " simultaneously"));
            }
            return ;
          }
          if (value !== undefined) {
            this.__using_binding__[key] = use;
          }
          this[key] = value;
        };
      }
    }}, {}, BindBuilder);
  var $__default = PropertiesBuilder;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('a1atscript/ng2Directives/EventsBuilder',["./BindBuilder"], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var BindBuilder = $__0.default;
  var prefix = "___bindable___";
  var EventsBuilder = function EventsBuilder() {
    $traceurRuntime.superConstructor($EventsBuilder).apply(this, arguments);
    ;
  };
  var $EventsBuilder = EventsBuilder;
  ($traceurRuntime.createClass)(EventsBuilder, {setupProperty: function(key, events) {
      events[key] = "=?on" + this._bindObj[key][0].toUpperCase() + this._bindObj[key].slice(1);
    }}, {}, BindBuilder);
  var $__default = EventsBuilder;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('a1atscript/ng2Directives/ComponentInjector',["../Injector", "./Component", "../injectorTypes", "./Ng2DirectiveDefinitionObject", "./PropertiesBuilder", "./EventsBuilder", "../Router"], function($__0,$__2,$__4,$__6,$__8,$__10,$__12) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  if (!$__8 || !$__8.__esModule)
    $__8 = {default: $__8};
  if (!$__10 || !$__10.__esModule)
    $__10 = {default: $__10};
  if (!$__12 || !$__12.__esModule)
    $__12 = {default: $__12};
  var registerInjector = $__0.registerInjector;
  var $__3 = $__2,
      Component = $__3.Component,
      ViewBase = $__3.ViewBase;
  var ListInjector = $__4.ListInjector;
  var Ng2DirectiveDefinitionObject = $__6.default;
  var PropertiesBuilder = $__8.default;
  var EventsBuilder = $__10.default;
  var Router = $__12.Router;
  var ComponentInjector = function ComponentInjector() {
    $traceurRuntime.superConstructor($ComponentInjector).call(this);
    this.componentHooks = {
      before: [],
      after: []
    };
  };
  var $ComponentInjector = ComponentInjector;
  ($traceurRuntime.createClass)(ComponentInjector, {
    get annotationClass() {
      return Component;
    },
    _template: function(component) {
      return component.annotations.find((function(annotation) {
        return annotation instanceof ViewBase;
      })) || {};
    },
    instantiateOne: function(module, component, annotation) {
      if (annotation.injectables) {
        component.$inject = annotation.injectables;
      }
      Router.routeReader.read(component);
      var template = this._template(component);
      var properties = {},
          events = {},
          bind;
      if (annotation.properties) {
        properties = (new PropertiesBuilder(annotation.properties, component)).build();
      }
      if (annotation.events) {
        events = (new EventsBuilder(annotation.events, component)).build();
      }
      bind = Object.assign({}, properties, events);
      if (bind === {})
        bind = null;
      if (annotation.selector) {
        var ddo = new Ng2DirectiveDefinitionObject(component, annotation, template, bind);
        this.hooks('before', module, ddo);
        module.directive(ddo.name, ddo.factoryFn);
        this.hooks('after', module, ddo);
      }
    },
    hooks: function(phase, module, ddo) {
      this.componentHooks[phase].forEach((function(hook) {
        hook(module, ddo);
      }));
    }
  }, {}, ListInjector);
  registerInjector('component', ComponentInjector);
  return {};
});

define('a1atscript/bootstrap',["./Injector", "./Router"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Injector = $__0.Injector;
  var Router = $__2.Router;
  function bootstrap(appModule) {
    var appPrefix = arguments[1] !== (void 0) ? arguments[1] : "";
    var injector = new Injector(appPrefix);
    var moduleName = injector.instantiate(appModule);
    Router.routeInitializer.initialize(moduleName, appModule);
  }
  return {
    get bootstrap() {
      return bootstrap;
    },
    __esModule: true
  };
});

define('a1atscript',["./a1atscript/Injector", "./a1atscript/annotations", "./a1atscript/DirectiveObject", "./a1atscript/ng2Directives/ComponentInjector", "./a1atscript/ng2Directives/Component", "./a1atscript/ToAnnotation", "./a1atscript/bootstrap", "./a1atscript/Router"], function($__0,$__1,$__2,$__3,$__4,$__5,$__6,$__7) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__1 || !$__1.__esModule)
    $__1 = {default: $__1};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__3 || !$__3.__esModule)
    $__3 = {default: $__3};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__5 || !$__5.__esModule)
    $__5 = {default: $__5};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  if (!$__7 || !$__7.__esModule)
    $__7 = {default: $__7};
  var $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_Injector_46_js__ = $__0;
  var $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_annotations_46_js__ = $__1;
  var $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_DirectiveObject_46_js__ = $__2;
  $__3;
  var $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_ng2Directives_47_Component_46_js__ = $__4;
  var $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_ToAnnotation_46_js__ = $__5;
  var $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_bootstrap_46_js__ = $__6;
  var $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_Router_46_js__ = $__7;
  return {
    get registerInjector() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_Injector_46_js__.registerInjector;
    },
    get getInjector() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_Injector_46_js__.getInjector;
    },
    get Injector() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_Injector_46_js__.Injector;
    },
    get Config() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_annotations_46_js__.Config;
    },
    get Run() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_annotations_46_js__.Run;
    },
    get Controller() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_annotations_46_js__.Controller;
    },
    get Directive() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_annotations_46_js__.Directive;
    },
    get Service() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_annotations_46_js__.Service;
    },
    get Factory() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_annotations_46_js__.Factory;
    },
    get Provider() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_annotations_46_js__.Provider;
    },
    get Value() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_annotations_46_js__.Value;
    },
    get Constant() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_annotations_46_js__.Constant;
    },
    get Filter() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_annotations_46_js__.Filter;
    },
    get Animation() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_annotations_46_js__.Animation;
    },
    get Module() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_annotations_46_js__.Module;
    },
    get AsModule() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_annotations_46_js__.AsModule;
    },
    get DirectiveObject() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_DirectiveObject_46_js__.DirectiveObject;
    },
    get Component() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_ng2Directives_47_Component_46_js__.Component;
    },
    get Template() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_ng2Directives_47_Component_46_js__.Template;
    },
    get View() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_ng2Directives_47_Component_46_js__.View;
    },
    get ToAnnotation() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_ToAnnotation_46_js__.ToAnnotation;
    },
    get bootstrap() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_bootstrap_46_js__.bootstrap;
    },
    get Router() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_Router_46_js__.Router;
    },
    get RouteConfig() {
      return $___46__46__47_node_95_modules_47_a1atscript_47_dist_47_a1atscript_46_js_47_Router_46_js__.RouteConfig;
    },
    __esModule: true
  };
});

define('relayer/SimpleFactoryInjector',["a1atscript"], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var $__1 = $__0,
      registerInjector = $__1.registerInjector,
      ToAnnotation = $__1.ToAnnotation;
  var SimpleFactory = function SimpleFactory(token) {
    var dependencies = arguments[1] !== (void 0) ? arguments[1] : [];
    this.token = token;
    this.dependencies = dependencies;
  };
  ($traceurRuntime.createClass)(SimpleFactory, {}, {});
  Object.defineProperty(SimpleFactory, "annotations", {get: function() {
      return [new ToAnnotation];
    }});
  var SimpleFactoryInjector = function SimpleFactoryInjector() {
    ;
  };
  ($traceurRuntime.createClass)(SimpleFactoryInjector, {
    get annotationClass() {
      return SimpleFactory;
    },
    instantiate: function(module, dependencyList) {
      var $__2 = this;
      dependencyList.forEach((function(dependencyObject) {
        $__2.instantiateOne(module, dependencyObject.dependency, dependencyObject.metadata);
      }));
    },
    instantiateOne: function(module, FactoryClass, metadata) {
      var injector = this;
      var factory = function() {
        for (var passedDependencies = [],
            $__4 = 0; $__4 < arguments.length; $__4++)
          passedDependencies[$__4] = arguments[$__4];
        return function() {
          for (var args = [],
              $__5 = 0; $__5 < arguments.length; $__5++)
            args[$__5] = arguments[$__5];
          var newArgs = passedDependencies.concat(args);
          var builtObject = new (Function.prototype.bind.apply(FactoryClass, $traceurRuntime.spread([null], newArgs)))();
          return builtObject;
        };
      };
      factory['$inject'] = metadata.dependencies;
      module.factory(metadata.token, factory);
    }
  }, {});
  registerInjector('simpleFactory', SimpleFactoryInjector);
  return {
    get SimpleFactory() {
      return SimpleFactory;
    },
    get SimpleFactoryInjector() {
      return SimpleFactoryInjector;
    },
    __esModule: true
  };
});

define('relayer/DataWrapper',["./jsonpath", "./SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var jsonPath = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var DataWrapper = function DataWrapper(response) {
    this._response = response;
  };
  ($traceurRuntime.createClass)(DataWrapper, {
    pathBuild: function(path, value) {
      var segments = path.split(".");
      var root = segments.shift();
      if (root !== "$") {
        console.log(("root of path " + path + " was " + root + ", not \"$\""));
        return false;
      }
      var target = segments.pop();
      var thumb = this._response;
      segments.forEach((function(segment) {
        if (segment === '') {
          return ;
        }
        if (!thumb[segment]) {
          thumb[segment] = {};
        }
        thumb = thumb[segment];
      }));
      thumb[target] = value;
    },
    pathGet: function(path) {
      var temp = jsonPath(this._response, path, {
        flatten: false,
        wrap: true
      });
      if (temp.length === 0) {
        return undefined;
      } else {
        return temp[0];
      }
    },
    pathSet: function(jsonpath, value) {
      var path = jsonPath(this._response, jsonpath, {
        wrap: true,
        resultType: "path"
      });
      if (path && path.length > 0) {
        path = path[0];
        if (path[0] !== "$") {
          console.log(("Warning! root of normalized path '" + path + "' was '" + path[0] + "', not '$'"));
        }
        var root = path.shift();
        var target = path.pop();
        var thumb = this._response;
        var $__8 = true;
        var $__9 = false;
        var $__10 = undefined;
        try {
          for (var $__6 = void 0,
              $__5 = (path)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__8 = ($__6 = $__5.next()).done); $__8 = true) {
            var segment = $__6.value;
            {
              thumb = thumb[segment];
            }
          }
        } catch ($__11) {
          $__9 = true;
          $__10 = $__11;
        } finally {
          try {
            if (!$__8 && $__5.return != null) {
              $__5.return();
            }
          } finally {
            if ($__9) {
              throw $__10;
            }
          }
        }
        if (thumb[target] != value) {
          this._dirty = true;
        }
        thumb[target] = value;
      } else {}
    },
    pathClear: function(jsonpath) {
      var path = jsonPath(this._response, jsonpath, {
        wrap: true,
        resultType: "path"
      });
      if (path && path.length === 0) {
        return ;
      }
      path = path[0];
      if (path[0] !== "$") {
        console.log(("root of normalized path was '" + path[0] + "', not '$'"));
      }
      var root = path.shift();
      var target = path.pop();
      var thumb = this._response;
      var $__8 = true;
      var $__9 = false;
      var $__10 = undefined;
      try {
        for (var $__6 = void 0,
            $__5 = (path)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__8 = ($__6 = $__5.next()).done); $__8 = true) {
          var segment = $__6.value;
          {
            thumb = thumb[segment];
          }
        }
      } catch ($__11) {
        $__9 = true;
        $__10 = $__11;
      } finally {
        try {
          if (!$__8 && $__5.return != null) {
            $__5.return();
          }
        } finally {
          if ($__9) {
            throw $__10;
          }
        }
      }
      delete thumb[target];
    }
  }, {});
  var $__default = DataWrapper;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/APIError',["./DataWrapper"], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var DataWrapper = $__0.default;
  var APIError = function APIError(responseData) {
    var $__2;
    $traceurRuntime.superConstructor($APIError).call(this);
    this._response = responseData.data;
    this.unhandled = [];
    if (this.jsonPaths) {
      this.unhandled = Object.getOwnPropertyNames(this.jsonPaths).filter(($__2 = this, function(name) {
        return $__2[name] && $__2[name].message;
      })).map((function(name) {
        return name;
      }));
    }
  };
  var $APIError = APIError;
  ($traceurRuntime.createClass)(APIError, {handleMessage: function(attrName) {
      if (this[attrName]) {
        this.unhandled = this.unhandled.filter((function(name) {
          return name != attrName;
        }));
        return this[attrName].message;
      }
    }}, {}, DataWrapper);
  var $__default = APIError;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/ResourceDescription',["./APIError", "a1atscript", "./SimpleFactoryInjector"], function($__0,$__2,$__4) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var APIError = $__0.default;
  var Service = $__2.Service;
  var SimpleFactory = $__4.SimpleFactory;
  var resourcesToInitialize = [];
  function describeResource(resourceClass, defineFn) {
    resourcesToInitialize.push({
      resourceClass: resourceClass,
      defineFn: defineFn
    });
  }
  var InitializedResourceClasses = function InitializedResourceClasses(resourceDescriptionFactory) {
    this.resourceDescriptionFactory = resourceDescriptionFactory;
    this.initializeClasses();
  };
  ($traceurRuntime.createClass)(InitializedResourceClasses, {initializeClasses: function() {
      var $__6 = this;
      resourcesToInitialize.forEach((function(resourceToInitialize) {
        var resourceClass = resourceToInitialize.resourceClass;
        var defineFn = resourceToInitialize.defineFn;
        var resourceDescription = resourceClass.description($__6.resourceDescriptionFactory);
        defineFn(resourceDescription);
      }));
      return resourcesToInitialize.map((function(resourceToInitialize) {
        var resourceClass = resourceToInitialize.resourceClass;
        var resourceDescription = resourceClass.resourceDescription;
        var errorClass = function(responseData) {
          APIError.call(this);
        };
        errorClass.relationships = {};
        errorClass.prototype = Object.create(APIError.prototype);
        errorClass.prototype.constructor = errorClass;
        resourceDescription.applyToResource(resourceClass.prototype);
        resourceDescription.applyToError(errorClass.prototype);
        resourceClass.errorClass = errorClass;
        return resourceClass;
      }));
    }}, {});
  Object.defineProperty(InitializedResourceClasses, "annotations", {get: function() {
      return [new Service('InitializedResourceClasses', ['ResourceDescriptionFactory'])];
    }});
  var ResourceDescription = function ResourceDescription(jsonPropertyDecoratorFactory, relatedResourceDecoratorFactory, singleRelationshipDescriptionFactory, manyRelationshipDescriptionFactory, listRelationshipDescriptionFactory, mapRelationshipDescriptionFactory, inflector) {
    this.jsonPropertyDecoratorFactory = jsonPropertyDecoratorFactory;
    this.relatedResourceDecoratorFactory = relatedResourceDecoratorFactory;
    this.singleRelationshipDescriptionFactory = singleRelationshipDescriptionFactory;
    this.manyRelationshipDescriptionFactory = manyRelationshipDescriptionFactory;
    this.listRelationshipDescriptionFactory = listRelationshipDescriptionFactory;
    this.mapRelationshipDescriptionFactory = mapRelationshipDescriptionFactory;
    this.inflector = inflector;
    this.decorators = {};
    this.allDecorators = [];
    this.parentDescription = null;
  };
  ($traceurRuntime.createClass)(ResourceDescription, {
    chainFrom: function(other) {
      if (this.parentDescription && this.parentDescription !== other) {
        throw new Error("Attempted to rechain description: existing parent if of " + (this.parentDescription.ResourceClass + ", new is of " + other.ResourceClass));
      } else {
        this.parentDescription = other;
      }
    },
    recordDecorator: function(name, decoratorDescription) {
      this.decorators[name] = this.decorators[name] || [];
      this.decorators[name].push(decoratorDescription);
      this.allDecorators.push(decoratorDescription);
      return decoratorDescription;
    },
    applyToResource: function(resource) {
      this.allDecorators.forEach((function(decorator) {
        decorator.resourceApply(resource);
      }));
      if (this.parentDescription) {
        this.parentDescription.applyToResource(resource);
      }
    },
    applyToError: function(error) {
      this.allDecorators.forEach((function(decorator) {
        decorator.errorsApply(error);
      }));
      if (this.parentDescription) {
        this.parentDescription.applyToError(error);
      }
    },
    applyToEndpoint: function(endpoint) {
      this.allDecorators.forEach((function(decorator) {
        decorator.endpointApply(endpoint);
      }));
      if (this.parentDescription) {
        this.parentDescription.applyToEndpoint(endpoint);
      }
    },
    property: function(property, initial) {
      this.jsonProperty(property, ("$.data." + this.inflector.underscore(property)), initial);
    },
    hasOne: function(property, rezClass, initialValues) {
      return this.relatedResource(property, rezClass, initialValues, this.singleRelationshipDescriptionFactory);
    },
    hasMany: function(property, rezClass, initialValues) {
      return this.relatedResource(property, rezClass, initialValues, this.manyRelationshipDescriptionFactory);
    },
    hasList: function(property, rezClass, initialValues) {
      return this.relatedResource(property, rezClass, initialValues, this.listRelationshipDescriptionFactory);
    },
    hasMap: function(property, rezClass, initialValue) {
      return this.relatedResource(property, rezClass, initialValue, this.mapRelationshipDescriptionFactory);
    },
    jsonProperty: function(name, path, value, options) {
      return this.recordDecorator(name, this.jsonPropertyDecoratorFactory(name, path, value, options));
    },
    relatedResource: function(property, rezClass, initialValues, relationshipDescriptionFactory) {
      var relationship = relationshipDescriptionFactory(property, rezClass, initialValues);
      this.recordDecorator(name, this.relatedResourceDecoratorFactory(property, relationship));
      return relationship;
    }
  }, {});
  Object.defineProperty(ResourceDescription, "annotations", {get: function() {
      return [new SimpleFactory('ResourceDescriptionFactory', ['JsonPropertyDecoratorFactory', 'RelatedResourceDecoratorFactory', 'SingleRelationshipDescriptionFactory', 'ManyRelationshipDescriptionFactory', 'ListRelationshipDescriptionFactory', 'MapRelationshipDescriptionFactory', 'Inflector'])];
    }});
  return {
    get describeResource() {
      return describeResource;
    },
    get InitializedResourceClasses() {
      return InitializedResourceClasses;
    },
    get ResourceDescription() {
      return ResourceDescription;
    },
    __esModule: true
  };
});

define('relayer/Resource',["./DataWrapper"], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var DataWrapper = $__0.default;
  var paths = {
    publicUrl: "$.links.public",
    adminUrl: "$.links.admin",
    selfUrl: "$.links.self"
  };
  var Resource = function Resource(responseData) {
    $traceurRuntime.superConstructor($Resource).call(this, responseData);
    if (!responseData) {
      this.emptyData();
    }
    this.errorReason = null;
    this.templatedUrl = null;
    this.resolved = false;
    this._dirty = false;
  };
  var $Resource = Resource;
  ($traceurRuntime.createClass)(Resource, {
    get url() {
      return this.templatedUrl.url;
    },
    get uriTemplate() {
      return this.templatedUrl.uriTemplate;
    },
    get uriParams() {
      return this.templatedUrl.uriParams;
    },
    create: function(resource, res, rej) {
      if (this.isPersisted) {
        return this.self().create(resource, res, rej);
      }
    },
    remove: function(res, rej) {
      if (this.isPersisted) {
        return this.self().remove(res, rej);
      }
    },
    update: function(res, rej) {
      if (this.isPersisted) {
        return this.self().update(this, res, rej);
      }
    },
    load: function(res, rej) {
      if (this.isPersisted) {
        return this.self().load(res, rej);
      }
    },
    get isDirty() {
      return this._dirty;
    },
    get isPersisted() {
      return ((this.self && this.self()) ? true : false);
    },
    get _data() {
      return this._response["data"];
    },
    get _links() {
      return this._response["links"];
    },
    absorbResponse: function(response) {
      this._response = response;
    },
    setInitialValue: function(path, value) {
      this.initialValues.push({
        path: path,
        value: value
      });
    },
    get initialValues() {
      if (!this.hasOwnProperty("_initialValues")) {
        if (this._initialValues) {
          this._initialValues = this._initialValues.slice(0);
        } else {
          this._initialValues = [];
        }
      }
      return this._initialValues;
    },
    emptyData: function() {
      var $__2 = this;
      this._response = {
        data: {},
        links: {}
      };
      this.initialValues.forEach((function(initialValue) {
        $__2.pathBuild(initialValue.path, initialValue.value);
      }));
      Object.keys(this.constructor.relationships).forEach((function(relationshipName) {
        var relationshipDescription = $__2.constructor.relationships[relationshipName];
        if (relationshipDescription.initializeOnCreate) {
          var relationship = relationshipDescription.initializer.initialize();
          $__2.relationships[relationshipName] = relationship;
        }
      }));
    },
    get relationships() {
      this._relationships = this._relationships || {};
      return this._relationships;
    },
    set relationships(relationships) {
      this._relationships = relationships;
      return this._relationships;
    },
    get shortLink() {
      return this.uriParams[Object.keys(this.uriParams)[0]];
    },
    get response() {
      return this._response;
    }
  }, {
    get relationships() {
      if (!this.hasOwnProperty("_relationships")) {
        this._relationships = Object.create(this._relationships || {});
      }
      return this._relationships;
    },
    description: function(resourceDescriptionFactory) {
      var parent = Object.getPrototypeOf(this);
      if (parent !== $Resource && parent.description) {
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
  }, DataWrapper);
  var $__default = Resource;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/endpoints/Endpoint',[], function() {
  
  var Endpoint = function Endpoint() {};
  ($traceurRuntime.createClass)(Endpoint, {
    create: function(resource, res, rej) {
      return this.endpointPromise().then((function(endpoint) {
        if (endpoint._create) {
          return endpoint._create(resource);
        } else {
          return endpoint.create(resource);
        }
      })).then(res, rej);
    },
    update: function(resource, res, rej) {
      return this.endpointPromise().then((function(endpoint) {
        if (endpoint._update) {
          return endpoint._update(resource);
        } else {
          return endpoint.update(resource);
        }
      })).then(res, rej);
    },
    load: function(res, rej) {
      return this.endpointPromise().then((function(endpoint) {
        if (endpoint._load) {
          return endpoint._load();
        } else {
          return endpoint.load();
        }
      })).then(res, rej);
    },
    get: function(prop) {
      for (var args = [],
          $__1 = 1; $__1 < arguments.length; $__1++)
        args[$__1 - 1] = arguments[$__1];
      return this.load().then((function(response) {
        var $__2;
        if (typeof response[prop] == 'function') {
          return ($__2 = response)[prop].apply($__2, $traceurRuntime.spread(args));
        } else {
          return response[prop];
        }
      }));
    },
    remove: function(res, rej) {
      return this.endpointPromise().then((function(endpoint) {
        return endpoint._remove();
      })).then(res, rej);
    }
  }, {});
  var $__default = Endpoint;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/endpoints/PromiseEndpoint',["./Endpoint", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Endpoint = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var PromiseEndpoint = function PromiseEndpoint(promiseFunction) {
    $traceurRuntime.superConstructor($PromiseEndpoint).call(this);
    this.endpointPromise = promiseFunction;
  };
  var $PromiseEndpoint = PromiseEndpoint;
  ($traceurRuntime.createClass)(PromiseEndpoint, {}, {}, Endpoint);
  var $__default = PromiseEndpoint;
  Object.defineProperty(PromiseEndpoint, "annotations", {get: function() {
      return [new SimpleFactory('PromiseEndpointFactory')];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/endpoints/ResolvedEndpoint',["./Endpoint", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Endpoint = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var ResolvedEndpoint = function ResolvedEndpoint(Promise, transport, templatedUrl) {
    var resourceTransformers = arguments[3] !== (void 0) ? arguments[3] : [];
    var createResourceTransformers = arguments[4] !== (void 0) ? arguments[4] : [];
    var $__4;
    $traceurRuntime.superConstructor($ResolvedEndpoint).call(this);
    this.transport = transport;
    this.templatedUrl = templatedUrl;
    if (Array.isArray(resourceTransformers)) {
      this.resourceTransformers = resourceTransformers;
    } else {
      this.resourceTransformers = [resourceTransformers];
    }
    if (Array.isArray(createResourceTransformers)) {
      this.createResourceTransformers = createResourceTransformers;
    } else {
      this.createResourceTransformers = [createResourceTransformers];
    }
    this.endpointPromise = ($__4 = this, function() {
      return Promise.resolve($__4);
    });
  };
  var $ResolvedEndpoint = ResolvedEndpoint;
  ($traceurRuntime.createClass)(ResolvedEndpoint, {
    _load: function() {
      var response = this.transport.get(this.templatedUrl.url, this.templatedUrl.etag);
      return this._transformResponse(this.resourceTransformers, response);
    },
    _update: function(resource) {
      var request = this._transformRequest(this.resourceTransformers, resource);
      var response = this.transport.put(this.templatedUrl.url, request, this.templatedUrl.etag);
      return this._transformResponse(this.resourceTransformers, response);
    },
    _create: function(resource) {
      var request = this._transformRequest(this.createResourceTransformers, resource);
      var response = this.transport.post(this.templatedUrl.url, request);
      return this._transformResponse(this.createResourceTransformers, response);
    },
    _transformResponse: function(transformers, response) {
      var $__4 = this;
      return transformers.reduce((function(interimResponse, transformer) {
        return transformer.transformResponse($__4, interimResponse);
      }), response);
    },
    _transformRequest: function(transformers, request) {
      var $__4 = this;
      return transformers.slice(0).reverse().reduce((function(interimRequest, transformer) {
        return transformer.transformRequest($__4, interimRequest);
      }), request);
    },
    _remove: function() {
      return this.transport.remove(this.templatedUrl.url);
    }
  }, {}, Endpoint);
  var $__default = ResolvedEndpoint;
  Object.defineProperty(ResolvedEndpoint, "annotations", {get: function() {
      return [new SimpleFactory('ResolvedEndpointFactory', ["RelayerPromise"])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/endpoints/LoadedDataEndpoint',["./ResolvedEndpoint", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var ResolvedEndpoint = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var LoadedDataEndpoint = function LoadedDataEndpoint(Promise, resolvedEndpoint, resource) {
    var resourceTransformers = arguments[3] !== (void 0) ? arguments[3] : [];
    var createResourceTransformers = arguments[4] !== (void 0) ? arguments[4] : [];
    $traceurRuntime.superConstructor($LoadedDataEndpoint).call(this, Promise, resolvedEndpoint.transport, resolvedEndpoint.templatedUrl, resolvedEndpoint.resourceTransformers.concat(resourceTransformers), resolvedEndpoint.createResourceTransformers.concat(createResourceTransformers));
    this.resource = resource;
    this.Promise = Promise;
    this.data = resolvedEndpoint._transformRequest(resolvedEndpoint.resourceTransformers, resource);
  };
  var $LoadedDataEndpoint = LoadedDataEndpoint;
  ($traceurRuntime.createClass)(LoadedDataEndpoint, {
    _load: function() {
      return this._transformResponse(this.resourceTransformers, this.Promise.resolve({
        data: this.data,
        etag: this.templatedUrl.etag
      }));
    },
    _update: function(resource) {
      var $__4 = this;
      var request = this._transformRequest(this.resourceTransformers, resource);
      var response = this.transport.put(this.templatedUrl.url, request);
      response = response.then((function(data) {
        $__4.data = data.data;
        return data;
      }));
      return this._transformResponse(this.resourceTransformers, response);
    }
  }, {}, ResolvedEndpoint);
  var $__default = LoadedDataEndpoint;
  Object.defineProperty(LoadedDataEndpoint, "annotations", {get: function() {
      return [new SimpleFactory('LoadedDataEndpointFactory', ['RelayerPromise'])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/endpoints',["./endpoints/PromiseEndpoint", "./endpoints/ResolvedEndpoint", "./endpoints/LoadedDataEndpoint"], function($__0,$__1,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__1 || !$__1.__esModule)
    $__1 = {default: $__1};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var $__endpoints_47_PromiseEndpoint_46_js__ = $__0;
  var $__endpoints_47_ResolvedEndpoint_46_js__ = $__1;
  var $__endpoints_47_LoadedDataEndpoint_46_js__ = $__2;
  return {
    get PromiseEndpoint() {
      return $__endpoints_47_PromiseEndpoint_46_js__.default;
    },
    get ResolvedEndpoint() {
      return $__endpoints_47_ResolvedEndpoint_46_js__.default;
    },
    get LoadedDataEndpoint() {
      return $__endpoints_47_LoadedDataEndpoint_46_js__.default;
    },
    __esModule: true
  };
});

define('relayer/serializers/Serializer',[], function() {
  
  var Serializer = function Serializer(resource) {
    this.resource = resource;
  };
  ($traceurRuntime.createClass)(Serializer, {serialize: function() {}}, {});
  var $__default = Serializer;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/TemplatedUrl',["./SimpleFactoryInjector"], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var SimpleFactory = $__0.SimpleFactory;
  var TemplatedUrl = function TemplatedUrl(uriTemplate) {
    var uriParams = arguments[1] !== (void 0) ? arguments[1] : {};
    this._uriTemplate = new UriTemplate(uriTemplate);
    this._uriParams = uriParams;
    this._paths = [];
  };
  ($traceurRuntime.createClass)(TemplatedUrl, {
    get uriTemplate() {
      return this._uriTemplate.toString();
    },
    get uriParams() {
      return this._uriParams;
    },
    get url() {
      return this._uriTemplate.fillFromObject(this._uriParams);
    },
    _setUrl: function(url) {
      var uriParams = this._uriTemplate.fromUri(url);
      this._uriParams = uriParams;
    },
    addDataPathLink: function(resource, path) {
      var overwrite = arguments[2] !== (void 0) ? arguments[2] : true;
      if (overwrite) {
        var newUrl = resource.pathGet(path);
        if (newUrl) {
          this._setUrl(newUrl);
          this._paths.forEach((function(path) {
            path.resource.pathSet(path.path, newUrl);
          }));
        }
      } else {
        resource.pathSet(path, this.url);
      }
      this._paths.push({
        resource: resource,
        path: path
      });
    },
    removeDataPathLink: function(resource, path) {
      this._paths = this._paths.filter((function(pathLink) {
        return (pathLink.resource != resource) || (pathLink.path != path);
      }));
    }
  }, {});
  Object.defineProperty(TemplatedUrl, "annotations", {get: function() {
      return [new SimpleFactory('TemplatedUrlFactory')];
    }});
  var TemplatedUrlFromUrl = function TemplatedUrlFromUrl(uriTemplate, url) {
    $traceurRuntime.superConstructor($TemplatedUrlFromUrl).call(this, uriTemplate);
    $traceurRuntime.superGet(this, $TemplatedUrlFromUrl.prototype, "_setUrl").call(this, url);
  };
  var $TemplatedUrlFromUrl = TemplatedUrlFromUrl;
  ($traceurRuntime.createClass)(TemplatedUrlFromUrl, {}, {}, TemplatedUrl);
  Object.defineProperty(TemplatedUrlFromUrl, "annotations", {get: function() {
      return [new SimpleFactory('TemplatedUrlFromUrlFactory')];
    }});
  return {
    get TemplatedUrl() {
      return TemplatedUrl;
    },
    get TemplatedUrlFromUrl() {
      return TemplatedUrlFromUrl;
    },
    __esModule: true
  };
});

define('relayer/serializers/ResourceSerializer',["./Serializer", "../SimpleFactoryInjector", "../TemplatedUrl"], function($__0,$__2,$__4) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var Serializer = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var TemplatedUrl = $__4.TemplatedUrl;
  var ResourceSerializer = function ResourceSerializer() {
    $traceurRuntime.superConstructor($ResourceSerializer).apply(this, arguments);
    ;
  };
  var $ResourceSerializer = ResourceSerializer;
  ($traceurRuntime.createClass)(ResourceSerializer, {serialize: function() {
      var $__6 = this;
      var relationship;
      Object.keys(this.resource.relationships).forEach((function(relationshipName) {
        var relationship = $__6.resource.relationships[relationshipName];
        if (!(relationship instanceof TemplatedUrl)) {
          var relationshipDefinition = $__6.resource.constructor.relationships[relationshipName];
          var serializer = relationshipDefinition.serializerFactory(relationship);
          $__6.resource.pathSet(relationshipDefinition.dataPath, serializer.serialize());
        }
      }));
      return this.resource.response;
    }}, {}, Serializer);
  var $__default = ResourceSerializer;
  Object.defineProperty(ResourceSerializer, "annotations", {get: function() {
      return [new SimpleFactory('ResourceSerializerFactory', [])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/serializers/ManyResourceSerializer',["./Serializer", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Serializer = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var ManyResourceSerializer = function ManyResourceSerializer(resourceSerializerFactory, resource) {
    $traceurRuntime.superConstructor($ManyResourceSerializer).call(this, resource);
    this.resourceSerializerFactory = resourceSerializerFactory;
  };
  var $ManyResourceSerializer = ManyResourceSerializer;
  ($traceurRuntime.createClass)(ManyResourceSerializer, {serialize: function() {
      var $__4 = this;
      return this.resource.map((function(resource) {
        return $__4.resourceSerializerFactory(resource).serialize();
      }));
    }}, {}, Serializer);
  var $__default = ManyResourceSerializer;
  Object.defineProperty(ManyResourceSerializer, "annotations", {get: function() {
      return [new SimpleFactory('ManyResourceSerializerFactory', ['ResourceSerializerFactory'])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/serializers/ListResourceSerializer',["../SimpleFactoryInjector", "./Serializer"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var SimpleFactory = $__0.SimpleFactory;
  var Serializer = $__2.default;
  var ListResourceSerializer = function ListResourceSerializer(manyResourceSerializerFactory, resource) {
    $traceurRuntime.superConstructor($ListResourceSerializer).call(this, resource);
    this.manyResourceSerializerFactory = manyResourceSerializerFactory;
  };
  var $ListResourceSerializer = ListResourceSerializer;
  ($traceurRuntime.createClass)(ListResourceSerializer, {serialize: function() {
      var data = this.manyResourceSerializerFactory(this.resource).serialize();
      this.resource.resource.pathSet("$.data", data);
      return this.resource.resource.response;
    }}, {}, Serializer);
  var $__default = ListResourceSerializer;
  Object.defineProperty(ListResourceSerializer, "annotations", {get: function() {
      return [new SimpleFactory('ListResourceSerializerFactory', ['ManyResourceSerializerFactory'])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/serializers/MapResourceSerializer',["./Serializer", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Serializer = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var MapResourceSerializer = function MapResourceSerializer(resourceSerializerFactory, resource) {
    $traceurRuntime.superConstructor($MapResourceSerializer).call(this, resource);
    this.resourceSerializerFactory = resourceSerializerFactory;
  };
  var $MapResourceSerializer = MapResourceSerializer;
  ($traceurRuntime.createClass)(MapResourceSerializer, {serialize: function() {
      var $__4 = this;
      return Object.keys(this.resource).reduce((function(data, key) {
        data[key] = $__4.resourceSerializerFactory($__4.resource[key]).serialize();
        return data;
      }), {});
    }}, {}, Serializer);
  var $__default = MapResourceSerializer;
  Object.defineProperty(MapResourceSerializer, "annotations", {get: function() {
      return [new SimpleFactory('MapResourceSerializerFactory', ['ResourceSerializerFactory'])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/serializers',["./serializers/ResourceSerializer", "./serializers/ManyResourceSerializer", "./serializers/ListResourceSerializer", "./serializers/MapResourceSerializer"], function($__0,$__1,$__2,$__3) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__1 || !$__1.__esModule)
    $__1 = {default: $__1};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__3 || !$__3.__esModule)
    $__3 = {default: $__3};
  var $__serializers_47_ResourceSerializer_46_js__ = $__0;
  var $__serializers_47_ManyResourceSerializer_46_js__ = $__1;
  var $__serializers_47_ListResourceSerializer_46_js__ = $__2;
  var $__serializers_47_MapResourceSerializer_46_js__ = $__3;
  return {
    get ResourceSerializer() {
      return $__serializers_47_ResourceSerializer_46_js__.default;
    },
    get ManyResourceSerializer() {
      return $__serializers_47_ManyResourceSerializer_46_js__.default;
    },
    get ListResourceSerializer() {
      return $__serializers_47_ListResourceSerializer_46_js__.default;
    },
    get MapResourceSerializer() {
      return $__serializers_47_MapResourceSerializer_46_js__.default;
    },
    __esModule: true
  };
});

define('relayer/mappers/Mapper',[], function() {
  
  var Mapper = function Mapper(transport, response, relationshipDescription) {
    var useErrors = arguments[3] !== (void 0) ? arguments[3] : false;
    this.transport = transport;
    this.response = response;
    this.relationshipDescription = relationshipDescription;
    this.useErrors = useErrors;
  };
  ($traceurRuntime.createClass)(Mapper, {
    get ResourceClass() {
      if (this.useErrors) {
        return this.relationshipDescription.ResourceClass.errorClass;
      } else {
        return this.relationshipDescription.ResourceClass;
      }
    },
    get mapperFactory() {
      return this.relationshipDescription.mapperFactory;
    },
    get serializerFactory() {
      return this.relationshipDescription.serializerFactory;
    },
    map: function() {
      this.initializeModel();
      this.mapNestedRelationships();
      return this.mapped;
    }
  }, {});
  var $__default = Mapper;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/mappers/ResourceMapper',["./Mapper", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Mapper = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var ResourceMapper = function ResourceMapper(templatedUrlFromUrlFactory, resourceBuilderFactory, primaryResourceBuilderFactory, primaryResourceTransformerFactory, transport, response, relationshipDescription) {
    var endpoint = arguments[7] !== (void 0) ? arguments[7] : null;
    var useErrors = arguments[8] !== (void 0) ? arguments[8] : false;
    $traceurRuntime.superConstructor($ResourceMapper).call(this, transport, response, relationshipDescription, useErrors);
    this.primaryResourceTransformerFactory = primaryResourceTransformerFactory;
    this.templatedUrlFromUrlFactory = templatedUrlFromUrlFactory;
    this.resourceBuilderFactory = resourceBuilderFactory;
    this.primaryResourceBuilderFactory = primaryResourceBuilderFactory;
    this.endpoint = endpoint;
  };
  var $ResourceMapper = ResourceMapper;
  ($traceurRuntime.createClass)(ResourceMapper, {
    initializeModel: function() {
      if (this.endpoint) {
        this.mapped = this.primaryResourceBuilderFactory(this.response, this.ResourceClass).build(this.endpoint);
      } else {
        this.mapped = this.resourceBuilderFactory(this.transport, this.response, this.primaryResourceTransformer, this.ResourceClass).build(this.uriTemplate);
      }
    },
    get primaryResourceTransformer() {
      this._primaryResourceTransformer = this._primaryResourceTransformer || this.primaryResourceTransformerFactory(this.relationshipDescription);
      return this._primaryResourceTransformer;
    },
    mapNestedRelationships: function() {
      var relationship;
      this.mapped.relationships = {};
      for (var relationshipName in this.ResourceClass.relationships) {
        if (typeof this.ResourceClass.relationships[relationshipName] == 'object') {
          relationship = this.ResourceClass.relationships[relationshipName];
          if (this.mapped.pathGet(relationship.dataPath)) {
            var subMapper = relationship.mapperFactory(this.transport, this.mapped.pathGet(relationship.dataPath), relationship, this.useErrors);
            this.mapped.relationships[relationshipName] = subMapper.map();
          } else if (this.mapped.pathGet(relationship.linksPath)) {
            var templatedUrl = this.templatedUrlFromUrlFactory(this.mapped.pathGet(relationship.linksPath), this.mapped.pathGet(relationship.linksPath));
            templatedUrl.addDataPathLink(this.mapped, relationship.linksPath);
            this.mapped.relationships[relationshipName] = templatedUrl;
          }
        }
      }
    }
  }, {}, Mapper);
  var $__default = ResourceMapper;
  Object.defineProperty(ResourceMapper, "annotations", {get: function() {
      return [new SimpleFactory("ResourceMapperFactory", ["TemplatedUrlFromUrlFactory", "ResourceBuilderFactory", "PrimaryResourceBuilderFactory", "PrimaryResourceTransformerFactory"])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/mappers/ManyResourceMapper',["../SimpleFactoryInjector", "./Mapper"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var SimpleFactory = $__0.SimpleFactory;
  var Mapper = $__2.default;
  var ManyResourceMapper = function ManyResourceMapper(singleRelationshipDescriptionFactory, transport, response, relationshipDescription) {
    var useErrors = arguments[4] !== (void 0) ? arguments[4] : false;
    $traceurRuntime.superConstructor($ManyResourceMapper).call(this, transport, response, relationshipDescription, useErrors);
    this.singleRelationshipDescription = singleRelationshipDescriptionFactory("", this.ResourceClass);
  };
  var $ManyResourceMapper = ManyResourceMapper;
  ($traceurRuntime.createClass)(ManyResourceMapper, {
    initializeModel: function() {
      this.mapped = [];
    },
    mapNestedRelationships: function() {
      var $__4 = this;
      this.response.forEach((function(response) {
        var resourceMapper = $__4.singleRelationshipDescription.mapperFactory($__4.transport, response, $__4.singleRelationshipDescription);
        resourceMapper.uriTemplate = $__4.uriTemplate;
        $__4.mapped.push(resourceMapper.map());
      }));
    }
  }, {}, Mapper);
  var $__default = ManyResourceMapper;
  Object.defineProperty(ManyResourceMapper, "annotations", {get: function() {
      return [new SimpleFactory("ManyResourceMapperFactory", ["SingleRelationshipDescriptionFactory"])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/mappers/ListResourceMapper',["../SimpleFactoryInjector", "./ResourceMapper"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var SimpleFactory = $__0.SimpleFactory;
  var ResourceMapper = $__2.default;
  var ListResourceMapper = function ListResourceMapper(templatedUrlFromUrlFactory, resourceBuilderFactory, primaryResourceBuilderFactory, primaryResourceTransformerFactory, manyResourceMapperFactory, transport, response, relationshipDescription, endpoint) {
    var useErrors = arguments[9] !== (void 0) ? arguments[9] : false;
    $traceurRuntime.superConstructor($ListResourceMapper).call(this, templatedUrlFromUrlFactory, resourceBuilderFactory, primaryResourceBuilderFactory, primaryResourceTransformerFactory, transport, response, relationshipDescription, endpoint, useErrors);
    this.manyResourceMapperFactory = manyResourceMapperFactory;
  };
  var $ListResourceMapper = ListResourceMapper;
  ($traceurRuntime.createClass)(ListResourceMapper, {
    get ResourceClass() {
      return this.relationshipDescription.ListResourceClass;
    },
    get ItemResourceClass() {
      return this.relationshipDescription.ResourceClass;
    },
    mapNestedRelationships: function() {
      var $__4 = this;
      $traceurRuntime.superGet(this, $ListResourceMapper.prototype, "mapNestedRelationships").call(this);
      this.resource = this.mapped;
      var manyResourceMapper = this.manyResourceMapperFactory(this.transport, this.resource.pathGet("$.data"), this.relationshipDescription);
      manyResourceMapper.uriTemplate = this.resource.pathGet("$.links.template");
      this.mapped = manyResourceMapper.map();
      this.mapped.resource = this.resource;
      ["url", "uriTemplate", "uriParams"].forEach((function(func) {
        $__4.mapped[func] = function() {
          var $__8;
          for (var args = [],
              $__7 = 0; $__7 < arguments.length; $__7++)
            args[$__7] = arguments[$__7];
          return ($__8 = this.resource)[func].apply($__8, $traceurRuntime.spread(args));
        };
      }));
      var mapped = this.mapped;
      ["remove", "update", "load"].forEach((function(func) {
        $__4.mapped[func] = function() {
          var $__8;
          for (var args = [],
              $__7 = 0; $__7 < arguments.length; $__7++)
            args[$__7] = arguments[$__7];
          return ($__8 = this.resource.self())[func].apply($__8, $traceurRuntime.spread([mapped], args));
        };
      }));
      Object.keys(this.resource.relationships).forEach((function(key) {
        $__4.mapped[key] = function() {
          var $__8;
          for (var args = [],
              $__7 = 0; $__7 < arguments.length; $__7++)
            args[$__7] = arguments[$__7];
          return ($__8 = this.resource)[key].apply($__8, $traceurRuntime.spread(args));
        };
      }));
      this.mapped.create = function() {
        var $__8;
        for (var args = [],
            $__7 = 0; $__7 < arguments.length; $__7++)
          args[$__7] = arguments[$__7];
        var $__5 = this;
        return ($__8 = this.resource).create.apply($__8, $traceurRuntime.spread(args)).then((function(created) {
          $__5.push(created);
          return created;
        }));
      };
      var ItemResourceClass = this.ItemResourceClass;
      this.mapped.new = function() {
        return new ItemResourceClass();
      };
    }
  }, {}, ResourceMapper);
  var $__default = ListResourceMapper;
  Object.defineProperty(ListResourceMapper, "annotations", {get: function() {
      return [new SimpleFactory('ListResourceMapperFactory', ['TemplatedUrlFromUrlFactory', 'ResourceBuilderFactory', 'PrimaryResourceBuilderFactory', 'PrimaryResourceTransformerFactory', 'ManyResourceMapperFactory'])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/mappers/MapResourceMapper',["../SimpleFactoryInjector", "./Mapper"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var SimpleFactory = $__0.SimpleFactory;
  var Mapper = $__2.default;
  var MapResourceMapper = function MapResourceMapper(singleRelationshipDescriptionFactory, transport, response, relationshipDescription) {
    var useErrors = arguments[4] !== (void 0) ? arguments[4] : false;
    $traceurRuntime.superConstructor($MapResourceMapper).call(this, transport, response, relationshipDescription, useErrors);
    this.singleRelationshipDescription = singleRelationshipDescriptionFactory("", this.ResourceClass);
  };
  var $MapResourceMapper = MapResourceMapper;
  ($traceurRuntime.createClass)(MapResourceMapper, {
    initializeModel: function() {
      this.mapped = {};
    },
    mapNestedRelationships: function() {
      var $__4 = this;
      Object.keys(this.response).forEach((function(responseKey) {
        var response = $__4.response[responseKey];
        var singleResourceMapper = $__4.singleRelationshipDescription.mapperFactory($__4.transport, response, $__4.singleRelationshipDescription);
        $__4.mapped[responseKey] = singleResourceMapper.map();
      }));
    }
  }, {}, Mapper);
  var $__default = MapResourceMapper;
  Object.defineProperty(MapResourceMapper, "annotations", {get: function() {
      return [new SimpleFactory("MapResourceMapperFactory", ["SingleRelationshipDescriptionFactory"])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/mappers',["./mappers/ResourceMapper", "./mappers/ManyResourceMapper", "./mappers/ListResourceMapper", "./mappers/MapResourceMapper"], function($__0,$__1,$__2,$__3) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__1 || !$__1.__esModule)
    $__1 = {default: $__1};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__3 || !$__3.__esModule)
    $__3 = {default: $__3};
  var $__mappers_47_ResourceMapper_46_js__ = $__0;
  var $__mappers_47_ManyResourceMapper_46_js__ = $__1;
  var $__mappers_47_ListResourceMapper_46_js__ = $__2;
  var $__mappers_47_MapResourceMapper_46_js__ = $__3;
  return {
    get ResourceMapper() {
      return $__mappers_47_ResourceMapper_46_js__.default;
    },
    get ManyResourceMapper() {
      return $__mappers_47_ManyResourceMapper_46_js__.default;
    },
    get ListResourceMapper() {
      return $__mappers_47_ListResourceMapper_46_js__.default;
    },
    get MapResourceMapper() {
      return $__mappers_47_MapResourceMapper_46_js__.default;
    },
    __esModule: true
  };
});

define('relayer/transformers/ResourceTransformer',[], function() {
  
  var ResourceTransformer = function ResourceTransformer() {
    ;
  };
  ($traceurRuntime.createClass)(ResourceTransformer, {
    transformRequest: function(endpoint, resource) {
      return resource;
    },
    transformResponse: function(endpoint, response) {
      return response;
    }
  }, {});
  var $__default = ResourceTransformer;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/transformers/PrimaryResourceTransformer',["./ResourceTransformer", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var ResourceTransformer = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var PrimaryResourceTransformer = function PrimaryResourceTransformer(relationshipDescription) {
    $traceurRuntime.superConstructor($PrimaryResourceTransformer).call(this);
    this.relationshipDescription = relationshipDescription;
  };
  var $PrimaryResourceTransformer = PrimaryResourceTransformer;
  ($traceurRuntime.createClass)(PrimaryResourceTransformer, {
    get primaryResourceSerializerFactory() {
      return this.relationshipDescription.serializerFactory;
    },
    get primaryResourceMapperFactory() {
      return this.relationshipDescription.mapperFactory;
    },
    transformRequest: function(endpoint, resource) {
      return this.primaryResourceSerializerFactory(resource).serialize();
    },
    transformResponse: function(endpoint, response) {
      var $__4 = this;
      return response.then((function(resolvedResponse) {
        endpoint.templatedUrl.etag = resolvedResponse.etag;
        return $__4.primaryResourceMapperFactory(endpoint.transport, resolvedResponse.data, $__4.relationshipDescription, endpoint).map();
      })).catch((function(resolvedError) {
        throw $__4.primaryResourceMapperFactory(endpoint.transport, resolvedError.data, $__4.relationshipDescription, endpoint, true).map();
      }));
    }
  }, {}, ResourceTransformer);
  var $__default = PrimaryResourceTransformer;
  Object.defineProperty(PrimaryResourceTransformer, "annotations", {get: function() {
      return [new SimpleFactory('PrimaryResourceTransformerFactory', [])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/transformers/CreateResourceTransformer',["./PrimaryResourceTransformer", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var PrimaryResourceTransformer = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var CreateResourceTransformer = function CreateResourceTransformer() {
    $traceurRuntime.superConstructor($CreateResourceTransformer).apply(this, arguments);
    ;
  };
  var $CreateResourceTransformer = CreateResourceTransformer;
  ($traceurRuntime.createClass)(CreateResourceTransformer, {transformResponse: function(endpoint, response) {
      var $__4 = this;
      return response.then((function(resolvedResponse) {
        var resource = $__4.primaryResourceMapperFactory(endpoint.transport, resolvedResponse.data, $__4.relationshipDescription).map();
        resource.templatedUrl.etag = resolvedResponse.etag;
        return resource;
      })).catch((function(resolvedError) {
        throw $__4.primaryResourceMapperFactory(endpoint.transport, resolvedError.data, $__4.relationshipDescription, null, true).map();
      }));
    }}, {}, PrimaryResourceTransformer);
  var $__default = CreateResourceTransformer;
  Object.defineProperty(CreateResourceTransformer, "annotations", {get: function() {
      return [new SimpleFactory('CreateResourceTransformerFactory', [])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/transformers/EmbeddedPropertyTransformer',["./ResourceTransformer", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var ResourceTransformer = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var EmbeddedPropertyTransformer = function EmbeddedPropertyTransformer(path) {
    $traceurRuntime.superConstructor($EmbeddedPropertyTransformer).call(this);
    this.path = path;
  };
  var $EmbeddedPropertyTransformer = EmbeddedPropertyTransformer;
  ($traceurRuntime.createClass)(EmbeddedPropertyTransformer, {
    transformRequest: function(endpoint, value) {
      var resource = endpoint.resource;
      resource.pathSet(this.path, value);
      return resource;
    },
    transformResponse: function(endpoint, response) {
      var $__4 = this;
      return response.then((function(resource) {
        endpoint.resource = resource;
        return resource.pathGet($__4.path);
      })).catch((function(error) {
        throw error.pathGet($__4.path);
      }));
    }
  }, {}, ResourceTransformer);
  var $__default = EmbeddedPropertyTransformer;
  Object.defineProperty(EmbeddedPropertyTransformer, "annotations", {get: function() {
      return [new SimpleFactory('EmbeddedPropertyTransformerFactory')];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/transformers/EmbeddedRelationshipTransformer',["./ResourceTransformer", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var ResourceTransformer = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var EmbeddedRelationshipTransformer = function EmbeddedRelationshipTransformer(relationshipName) {
    $traceurRuntime.superConstructor($EmbeddedRelationshipTransformer).call(this);
    this.relationshipName = relationshipName;
  };
  var $EmbeddedRelationshipTransformer = EmbeddedRelationshipTransformer;
  ($traceurRuntime.createClass)(EmbeddedRelationshipTransformer, {
    transformRequest: function(endpoint, value) {
      var resource = endpoint.resource;
      resource.relationships[this.relationshipName] = value;
      return resource;
    },
    transformResponse: function(endpoint, response) {
      var $__4 = this;
      return response.then((function(resource) {
        endpoint.resource = resource;
        return resource.relationships[$__4.relationshipName];
      })).catch((function(error) {
        throw error.relationships[$__4.relationshipName];
      }));
    }
  }, {}, ResourceTransformer);
  var $__default = EmbeddedRelationshipTransformer;
  Object.defineProperty(EmbeddedRelationshipTransformer, "annotations", {get: function() {
      return [new SimpleFactory('EmbeddedRelationshipTransformerFactory')];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/transformers/SingleFromManyTransformer',["./ResourceTransformer", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var ResourceTransformer = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var SingleFromManyTransformer = function SingleFromManyTransformer(relationshipName, property) {
    $traceurRuntime.superConstructor($SingleFromManyTransformer).call(this);
    this.property = property;
    this.relationshipName = relationshipName;
  };
  var $SingleFromManyTransformer = SingleFromManyTransformer;
  ($traceurRuntime.createClass)(SingleFromManyTransformer, {
    transformRequest: function(endpoint, value) {
      var resource = endpoint.resource;
      resource.relationships[this.relationshipName][this.property] = value;
      return resource;
    },
    transformResponse: function(endpoint, response) {
      var $__4 = this;
      return response.then((function(resource) {
        endpoint.resource = resource;
        return resource.relationships[$__4.relationshipName][$__4.property];
      })).catch((function(error) {
        throw error.relationships[$__4.relationshipName][$__4.property];
      }));
    }
  }, {}, ResourceTransformer);
  var $__default = SingleFromManyTransformer;
  Object.defineProperty(SingleFromManyTransformer, "annotations", {get: function() {
      return [new SimpleFactory('SingleFromManyTransformerFactory')];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/transformers/IndividualFromListTransformer',["./ResourceTransformer", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var ResourceTransformer = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var IndividualFromListTransformer = function IndividualFromListTransformer(templatedUrlFactory, relationshipName, uriParams) {
    $traceurRuntime.superConstructor($IndividualFromListTransformer).call(this);
    this.templatedUrlFactory = templatedUrlFactory;
    this.relationshipName = relationshipName;
    this.uriParams = uriParams;
  };
  var $IndividualFromListTransformer = IndividualFromListTransformer;
  ($traceurRuntime.createClass)(IndividualFromListTransformer, {
    templatedUrl: function(relationship) {
      var template = relationship.resource.pathGet('$.links.template');
      var templatedUrl = this.templatedUrlFactory(template, this.uriParams);
      return templatedUrl.url;
    },
    findInRelationship: function(relationship) {
      var url = this.templatedUrl(relationship);
      return relationship.findIndex((function(resource) {
        return (resource.pathGet('$.links.self') == url);
      }));
    },
    transformRequest: function(endpoint, value) {
      var resource = endpoint.resource;
      var elementIndex = this.findInRelationship(resource.relationships[this.relationshipName]);
      resource.relationships[this.relationshipName][elementIndex] = value;
      return resource;
    },
    transformResponse: function(endpoint, response) {
      var $__4 = this;
      return response.then((function(resource) {
        endpoint.resource = resource;
        var elementIndex = $__4.findInRelationship(resource.relationships[$__4.relationshipName]);
        if (elementIndex == -1) {
          throw "Element Not Found In List";
        } else {
          return resource.relationships[$__4.relationshipName][elementIndex];
        }
      })).catch((function(error) {
        throw resource.relationshipName[$__4.relationshipName];
      }));
    }
  }, {}, ResourceTransformer);
  var $__default = IndividualFromListTransformer;
  Object.defineProperty(IndividualFromListTransformer, "annotations", {get: function() {
      return [new SimpleFactory('IndividualFromListTransformerFactory', ['TemplatedUrlFactory'])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/transformers/ThrowErrorTransformer',["./ResourceTransformer", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var ResourceTransformer = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var ThrowErrorTransformer = function ThrowErrorTransformer() {
    $traceurRuntime.superConstructor($ThrowErrorTransformer).apply(this, arguments);
    ;
  };
  var $ThrowErrorTransformer = ThrowErrorTransformer;
  ($traceurRuntime.createClass)(ThrowErrorTransformer, {
    transformRequest: function(endpoint, resource) {
      throw "This Resource Cannot Be Updated Or Created";
    },
    transformResponse: function(endpoint, response) {
      throw "There is no Resource To Create From This Response";
    }
  }, {}, ResourceTransformer);
  var $__default = ThrowErrorTransformer;
  Object.defineProperty(ThrowErrorTransformer, "annotations", {get: function() {
      return [new SimpleFactory('ThrowErrorTransformerFactory')];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/transformers',["./transformers/PrimaryResourceTransformer", "./transformers/CreateResourceTransformer", "./transformers/EmbeddedPropertyTransformer", "./transformers/EmbeddedRelationshipTransformer", "./transformers/SingleFromManyTransformer", "./transformers/IndividualFromListTransformer", "./transformers/ThrowErrorTransformer"], function($__0,$__1,$__2,$__3,$__4,$__5,$__6) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__1 || !$__1.__esModule)
    $__1 = {default: $__1};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__3 || !$__3.__esModule)
    $__3 = {default: $__3};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__5 || !$__5.__esModule)
    $__5 = {default: $__5};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  var $__transformers_47_PrimaryResourceTransformer_46_js__ = $__0;
  var $__transformers_47_CreateResourceTransformer_46_js__ = $__1;
  var $__transformers_47_EmbeddedPropertyTransformer_46_js__ = $__2;
  var $__transformers_47_EmbeddedRelationshipTransformer_46_js__ = $__3;
  var $__transformers_47_SingleFromManyTransformer_46_js__ = $__4;
  var $__transformers_47_IndividualFromListTransformer_46_js__ = $__5;
  var $__transformers_47_ThrowErrorTransformer_46_js__ = $__6;
  return {
    get PrimaryResourceTransformer() {
      return $__transformers_47_PrimaryResourceTransformer_46_js__.default;
    },
    get CreateResourceTransformer() {
      return $__transformers_47_CreateResourceTransformer_46_js__.default;
    },
    get EmbeddedPropertyTransformer() {
      return $__transformers_47_EmbeddedPropertyTransformer_46_js__.default;
    },
    get EmbeddedRelationshipTransformer() {
      return $__transformers_47_EmbeddedRelationshipTransformer_46_js__.default;
    },
    get SingleFromManyTransformer() {
      return $__transformers_47_SingleFromManyTransformer_46_js__.default;
    },
    get IndividualFromListTransformer() {
      return $__transformers_47_IndividualFromListTransformer_46_js__.default;
    },
    get ThrowErrorTransformer() {
      return $__transformers_47_ThrowErrorTransformer_46_js__.default;
    },
    __esModule: true
  };
});

define('relayer/initializers/RelationshipInitializer',[], function() {
  
  var RelationshipInitializer = function RelationshipInitializer(ResourceClass, initialValues) {
    this.ResourceClass = ResourceClass;
    this.initialValues = initialValues;
  };
  ($traceurRuntime.createClass)(RelationshipInitializer, {initialize: function() {}}, {});
  var $__default = RelationshipInitializer;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/initializers/SingleRelationshipInitializer',["./RelationshipInitializer", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var RelationshipInitializer = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var SingleRelationshipInitializer = function SingleRelationshipInitializer() {
    $traceurRuntime.superConstructor($SingleRelationshipInitializer).apply(this, arguments);
    ;
  };
  var $SingleRelationshipInitializer = SingleRelationshipInitializer;
  ($traceurRuntime.createClass)(SingleRelationshipInitializer, {initialize: function() {
      var $__4 = this;
      var relationship = new this.ResourceClass();
      if (this.initialValues) {
        Object.keys(this.initialValues).forEach((function(property) {
          relationship[property] = $__4.initialValues[property];
        }));
      }
      return relationship;
    }}, {}, RelationshipInitializer);
  var $__default = SingleRelationshipInitializer;
  Object.defineProperty(SingleRelationshipInitializer, "annotations", {get: function() {
      return [new SimpleFactory('SingleRelationshipInitializerFactory', [])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/initializers/ManyRelationshipInitializer',["./RelationshipInitializer", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var RelationshipInitializer = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var ManyRelationshipInitializer = function ManyRelationshipInitializer(singleRelationshipInitializerFactory, ResourceClass, initialValues) {
    $traceurRuntime.superConstructor($ManyRelationshipInitializer).call(this, ResourceClass, initialValues);
    this.singleRelationshipInitializerFactory = singleRelationshipInitializerFactory;
  };
  var $ManyRelationshipInitializer = ManyRelationshipInitializer;
  ($traceurRuntime.createClass)(ManyRelationshipInitializer, {initialize: function() {
      var $__4 = this;
      var relationship = [];
      var response = [];
      if (this.initialValues) {
        this.initialValues.forEach((function(initialValue) {
          var singleInitializer = $__4.singleRelationshipInitializerFactory($__4.ResourceClass, initialValue);
          var singleRelationship = singleInitializer.initialize();
          relationship.push(singleRelationship);
          response.push(singleRelationship.response);
        }));
      }
      return relationship;
    }}, {}, RelationshipInitializer);
  var $__default = ManyRelationshipInitializer;
  Object.defineProperty(ManyRelationshipInitializer, "annotations", {get: function() {
      return [new SimpleFactory('ManyRelationshipInitializerFactory', ['SingleRelationshipInitializerFactory'])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/initializers/ListRelationshipInitializer',["./RelationshipInitializer", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var RelationshipInitializer = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var ListRelationshipInitializer = function ListRelationshipInitializer(ListResource, manyRelationshipInitializerFactory, ResourceClass, initialValues) {
    $traceurRuntime.superConstructor($ListRelationshipInitializer).call(this, ResourceClass, initialValues);
    this.manyRelationshipInitializer = manyRelationshipInitializerFactory(ResourceClass, initialValues);
    this.ListResource = ListResource;
  };
  var $ListRelationshipInitializer = ListRelationshipInitializer;
  ($traceurRuntime.createClass)(ListRelationshipInitializer, {initialize: function() {
      var manyRelationships = this.manyRelationshipInitializer.initialize();
      var resource = new this.ListResource({
        data: manyRelationships.response,
        links: {}
      });
      manyRelationships.resource = resource;
      ["url", "uriTemplate", "uriParams", "create", "remove", "update", "load"].forEach((function(func) {
        manyRelationships[func] = function() {
          var $__6;
          for (var args = [],
              $__5 = 0; $__5 < arguments.length; $__5++)
            args[$__5] = arguments[$__5];
          return ($__6 = resource)[func].apply($__6, $traceurRuntime.spread(args));
        };
      }));
      return manyRelationships;
    }}, {}, RelationshipInitializer);
  var $__default = ListRelationshipInitializer;
  Object.defineProperty(ListRelationshipInitializer, "annotations", {get: function() {
      return [new SimpleFactory('ListRelationshipInitializerFactory', ['ListResource', 'ManyRelationshipInitializerFactory'])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/initializers/MapRelationshipInitializer',["./RelationshipInitializer", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var RelationshipInitializer = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var MapRelationshipInitializer = function MapRelationshipInitializer(singleRelationshipInitializerFactory, ResourceClass, initialValues) {
    $traceurRuntime.superConstructor($MapRelationshipInitializer).call(this, ResourceClass, initialValues);
    this.singleRelationshipInitializerFactory = singleRelationshipInitializerFactory;
  };
  var $MapRelationshipInitializer = MapRelationshipInitializer;
  ($traceurRuntime.createClass)(MapRelationshipInitializer, {initialize: function() {
      var $__4 = this;
      var relationship = {};
      var response = {};
      if (this.initialValues) {
        Object.keys(this.initialValues).forEach((function(key) {
          var singleInitializer = $__4.singleRelationshipInitializerFactory($__4.ResourceClass, $__4.initialValues[key]);
          var singleRelationship = singleInitializer.initialize();
          relationship[key] = singleRelationship;
          response[key] = singleRelationship.response;
        }));
      }
      return relationship;
    }}, {}, RelationshipInitializer);
  var $__default = MapRelationshipInitializer;
  Object.defineProperty(MapRelationshipInitializer, "annotations", {get: function() {
      return [new SimpleFactory('MapRelationshipInitializerFactory', ['SingleRelationshipInitializerFactory'])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/initializers',["./initializers/SingleRelationshipInitializer", "./initializers/ManyRelationshipInitializer", "./initializers/ListRelationshipInitializer", "./initializers/MapRelationshipInitializer"], function($__0,$__1,$__2,$__3) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__1 || !$__1.__esModule)
    $__1 = {default: $__1};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__3 || !$__3.__esModule)
    $__3 = {default: $__3};
  var $__initializers_47_SingleRelationshipInitializer_46_js__ = $__0;
  var $__initializers_47_ManyRelationshipInitializer_46_js__ = $__1;
  var $__initializers_47_ListRelationshipInitializer_46_js__ = $__2;
  var $__initializers_47_MapRelationshipInitializer_46_js__ = $__3;
  return {
    get SingleRelationshipInitializer() {
      return $__initializers_47_SingleRelationshipInitializer_46_js__.default;
    },
    get ManyRelationshipInitializer() {
      return $__initializers_47_ManyRelationshipInitializer_46_js__.default;
    },
    get ListRelationshipInitializer() {
      return $__initializers_47_ListRelationshipInitializer_46_js__.default;
    },
    get MapRelationshipInitializer() {
      return $__initializers_47_MapRelationshipInitializer_46_js__.default;
    },
    __esModule: true
  };
});

define('relayer/decorators/ResourceDecorator',[], function() {
  
  var ResourceDecorator = function ResourceDecorator(name) {
    this.name = name;
  };
  ($traceurRuntime.createClass)(ResourceDecorator, {
    addFunction: function(target, func) {
      if (!(target.hasOwnProperty(this.name))) {
        target[this.name] = func;
      }
    },
    resourceApply: function(resource) {},
    errorsApply: function(errors) {},
    endpointApply: function(endpoint) {}
  }, {});
  var $__default = ResourceDecorator;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/decorators/JsonPropertyDecorator',["./ResourceDecorator", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var ResourceDecorator = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var JsonPropertyDecorator = function JsonPropertyDecorator(loadedDataEndpointFactory, embeddedPropertyTransformerFactory, promiseEndpointFactory, name, path, value, options) {
    $traceurRuntime.superConstructor($JsonPropertyDecorator).call(this, name);
    this.path = path;
    this.options = options || {};
    this.loadedDataEndpointFactory = loadedDataEndpointFactory;
    this.embeddedPropertyTransformerFactory = embeddedPropertyTransformerFactory;
    this.promiseEndpointFactory = promiseEndpointFactory;
    this.value = value;
  };
  var $JsonPropertyDecorator = JsonPropertyDecorator;
  ($traceurRuntime.createClass)(JsonPropertyDecorator, {
    recordApply: function(target) {
      if (!(target.hasOwnProperty(this.name))) {
        var afterSet = this.options.afterSet;
        var path = this.path;
        Object.defineProperty(target, this.name, {
          enumerable: true,
          configurable: true,
          get: function() {
            return this.pathGet(path);
          },
          set: function(value) {
            var result = this.pathSet(path, value);
            if (afterSet) {
              afterSet.call(this);
            }
            return result;
          }
        });
      }
    },
    resourceApply: function(resource) {
      if (this.value !== undefined) {
        resource.setInitialValue(this.path, this.value);
      }
      this.recordApply(resource);
    },
    errorsApply: function(errors) {
      this.recordApply(errors);
    },
    get endpointFn() {
      if (!this._endpointFn) {
        var path = this.path;
        var promiseEndpointFactory = this.promiseEndpointFactory;
        var loadedDataEndpointFactory = this.loadedDataEndpointFactory;
        var embeddedPropertyTransformerFactory = this.embeddedPropertyTransformerFactory;
        this._endpointFn = function() {
          var uriParams = arguments[0] !== (void 0) ? arguments[0] : {};
          var $__4 = this;
          var newPromise = (function() {
            return $__4.load().then((function(resource) {
              return loadedDataEndpointFactory(resource.self(), resource, [embeddedPropertyTransformerFactory(path)]);
            }));
          });
          var newEndpoint = promiseEndpointFactory(newPromise);
          return newEndpoint;
        };
      }
      return this._endpointFn;
    },
    endpointApply: function(target) {
      this.addFunction(target, this.endpointFn);
    }
  }, {}, ResourceDecorator);
  var $__default = JsonPropertyDecorator;
  Object.defineProperty(JsonPropertyDecorator, "annotations", {get: function() {
      return [new SimpleFactory('JsonPropertyDecoratorFactory', ['LoadedDataEndpointFactory', 'EmbeddedPropertyTransformerFactory', 'PromiseEndpointFactory'])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/decorators/RelatedResourceDecorator',["./ResourceDecorator", "../TemplatedUrl", "../SimpleFactoryInjector"], function($__0,$__2,$__4) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var ResourceDecorator = $__0.default;
  var TemplatedUrl = $__2.TemplatedUrl;
  var SimpleFactory = $__4.SimpleFactory;
  var RelatedResourceDecorator = function RelatedResourceDecorator(promiseEndpointFactory, relationshipUtilities, name, relationship) {
    $traceurRuntime.superConstructor($RelatedResourceDecorator).call(this, name);
    this.promiseEndpointFactory = promiseEndpointFactory;
    this.relationshipUtilities = relationshipUtilities;
    this.relationship = relationship;
  };
  var $RelatedResourceDecorator = RelatedResourceDecorator;
  ($traceurRuntime.createClass)(RelatedResourceDecorator, {
    get resourceFn() {
      if (!this._resourceFn) {
        var name = this.name;
        var relationship = this.relationship;
        var promiseEndpointFactory = this.promiseEndpointFactory;
        var relationshipUtilities = this.relationshipUtilities;
        this._resourceFn = function(uriParams) {
          var recursiveCall = arguments[1] !== (void 0) ? arguments[1] : false;
          var $__6 = this;
          if (relationship.async && this.isPersisted) {
            var endpoint;
            if (!this.relationships[name]) {
              if (recursiveCall == false) {
                endpoint = promiseEndpointFactory((function() {
                  return $__6.self().load().then((function(resource) {
                    return resource[name](uriParams, true);
                  }));
                }));
              } else {
                throw "Error: Unable to find relationship, even on canonical resource";
              }
            } else if (this.relationships[name] instanceof TemplatedUrl) {
              endpoint = relationship.linkedEndpoint(this, uriParams);
            } else {
              endpoint = relationship.embeddedEndpoint(this, uriParams);
            }
            relationship.ResourceClass.resourceDescription.applyToEndpoint(endpoint);
            relationshipUtilities.addMethods(endpoint, this, name);
            return endpoint;
          } else {
            if (this.relationships[name] instanceof TemplatedUrl) {
              throw "Error: non-async relationships must be embedded";
            } else {
              if (uriParams) {
                return this.relationships[name][uriParams];
              } else {
                return this.relationships[name];
              }
            }
          }
        };
      }
      return this._resourceFn;
    },
    get errorFn() {
      if (!this._errorFn) {
        var name = this.name;
        var path = this.path;
        var relationship = this.relationship;
        this._errorFn = function(uriParams) {
          if (this.relationships[name] instanceof TemplatedUrl) {
            throw "Error: non-async relationships must be embedded";
          } else {
            if (uriParams) {
              return this.relationships[name][uriParams];
            } else {
              return this.relationships[name];
            }
          }
        };
      }
      return this._errorFn;
    },
    get endpointFn() {
      if (!this._endpointFn) {
        var name = this.name;
        var description = this.relationship.ResourceClass.resourceDescription;
        var relationship = this.relationship;
        var promiseEndpointFactory = this.promiseEndpointFactory;
        this._endpointFn = function() {
          var uriParams = arguments[0] !== (void 0) ? arguments[0] : {};
          var $__6 = this;
          var newPromise = (function() {
            return $__6.load().then((function(resource) {
              if (relationship.async) {
                return resource[name](uriParams);
              } else {
                var endpoint = relationship.embeddedEndpoint(resource, uriParams);
                description.applyToEndpoint(endpoint);
                return endpoint;
              }
            }));
          });
          var newEndpoint = promiseEndpointFactory(newPromise);
          relationship.decorateEndpoint(newEndpoint, uriParams);
          description.applyToEndpoint(newEndpoint);
          return newEndpoint;
        };
      }
      return this._endpointFn;
    },
    resourceApply: function(target) {
      target.constructor.relationships[this.name] = this.relationship;
      this.addFunction(target, this.resourceFn);
    },
    errorsApply: function(target) {
      target.constructor.relationships[this.name] = this.relationship;
      this.addFunction(target, this.errorFn);
    },
    endpointApply: function(target) {
      this.addFunction(target, this.endpointFn);
    }
  }, {}, ResourceDecorator);
  var $__default = RelatedResourceDecorator;
  Object.defineProperty(RelatedResourceDecorator, "annotations", {get: function() {
      return [new SimpleFactory("RelatedResourceDecoratorFactory", ['PromiseEndpointFactory', 'RelationshipUtilities'])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/decorators',["./decorators/JsonPropertyDecorator", "./decorators/RelatedResourceDecorator"], function($__0,$__1) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__1 || !$__1.__esModule)
    $__1 = {default: $__1};
  var $__decorators_47_JsonPropertyDecorator_46_js__ = $__0;
  var $__decorators_47_RelatedResourceDecorator_46_js__ = $__1;
  return {
    get JsonPropertyDecorator() {
      return $__decorators_47_JsonPropertyDecorator_46_js__.default;
    },
    get RelatedResourceDecorator() {
      return $__decorators_47_RelatedResourceDecorator_46_js__.default;
    },
    __esModule: true
  };
});

define('relayer/relationshipDescriptions/RelationshipDescription',[], function() {
  
  var RelationshipDescription = function RelationshipDescription(relationshipInitializerFactory, resourceMapperFactory, resourceSerializerFactory, inflector, name, ResourceClass, initialValues) {
    this.initializer = relationshipInitializerFactory(ResourceClass, initialValues);
    this.mapperFactory = resourceMapperFactory;
    this.serializerFactory = resourceSerializerFactory;
    this.inflector = inflector;
    this.name = name;
    this.ResourceClass = ResourceClass;
    this.initialValues = initialValues;
    this.async = true;
    if (initialValues == undefined) {
      this.initializeOnCreate = false;
    } else {
      this.initializeOnCreate = true;
    }
  };
  ($traceurRuntime.createClass)(RelationshipDescription, {
    get linksPath() {
      this._linksPath = this._linksPath || ("$.links." + this.inflector.underscore(this.name));
      return this._linksPath;
    },
    set linksPath(linksPath) {
      this._linksPath = linksPath;
      return this._linksPath;
    },
    get dataPath() {
      this._dataPath = this._dataPath || ("$.data." + this.inflector.underscore(this.name));
      return this._dataPath;
    },
    set dataPath(dataPath) {
      this._dataPath = dataPath;
      return this._dataPath;
    },
    decorateEndpoint: function(endpoint, uriParams) {}
  }, {});
  var $__default = RelationshipDescription;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/relationshipDescriptions/SingleRelationshipDescription',["./RelationshipDescription", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var RelationshipDescription = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var SingleRelationshipDescription = function SingleRelationshipDescription(relationshipInitializerFactory, resourceMapperFactory, resourceSerializerFactory, inflector, primaryResourceTransformerFactory, embeddedRelationshipTransformerFactory, resolvedEndpointFactory, loadedDataEndpointFactory, templatedUrlFromUrlFactory, name, ResourceClass, initialValues) {
    $traceurRuntime.superConstructor($SingleRelationshipDescription).call(this, relationshipInitializerFactory, resourceMapperFactory, resourceSerializerFactory, inflector, name, ResourceClass, initialValues);
    this.primaryResourceTransformerFactory = primaryResourceTransformerFactory;
    this.embeddedRelationshipTransformerFactory = embeddedRelationshipTransformerFactory;
    this.resolvedEndpointFactory = resolvedEndpointFactory;
    this.loadedDataEndpointFactory = loadedDataEndpointFactory;
    this.templatedUrlFromUrlFactory = templatedUrlFromUrlFactory;
  };
  var $SingleRelationshipDescription = SingleRelationshipDescription;
  ($traceurRuntime.createClass)(SingleRelationshipDescription, {
    embeddedEndpoint: function(parent, uriParams) {
      var parentEndpoint = parent.self();
      var embeddedRelationshipTransformer = this.embeddedRelationshipTransformerFactory(this.name);
      return this.loadedDataEndpointFactory(parentEndpoint, parent, embeddedRelationshipTransformer);
    },
    linkedEndpoint: function(parent, uriParams) {
      var transport = parent.self().transport;
      var url = parent.pathGet(this.linksPath);
      var templatedUrl = this.templatedUrlFromUrlFactory(url, url);
      templatedUrl.addDataPathLink(parent, this.linksPath);
      var primaryResourceTransformer = this.primaryResourceTransformerFactory(this);
      return this.resolvedEndpointFactory(transport, templatedUrl, primaryResourceTransformer);
    }
  }, {}, RelationshipDescription);
  var $__default = SingleRelationshipDescription;
  Object.defineProperty(SingleRelationshipDescription, "annotations", {get: function() {
      return [new SimpleFactory('SingleRelationshipDescriptionFactory', ['SingleRelationshipInitializerFactory', 'ResourceMapperFactory', 'ResourceSerializerFactory', 'Inflector', 'PrimaryResourceTransformerFactory', 'EmbeddedRelationshipTransformerFactory', 'ResolvedEndpointFactory', 'LoadedDataEndpointFactory', 'TemplatedUrlFromUrlFactory'])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/relationshipDescriptions/MultipleRelationshipDescription',["./RelationshipDescription"], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var RelationshipDescription = $__0.default;
  var MultipleRelationshipDescription = function MultipleRelationshipDescription(relationshipInitializerFactory, resourceMapperFactory, resourceSerializerFactory, inflector, embeddedRelationshipTransformerFactory, singleFromManyTransformerFactory, loadedDataEndpointFactory, name, ResourceClass, initialValues) {
    $traceurRuntime.superConstructor($MultipleRelationshipDescription).call(this, relationshipInitializerFactory, resourceMapperFactory, resourceSerializerFactory, inflector, name, ResourceClass, initialValues);
    this.embeddedRelationshipTransformerFactory = embeddedRelationshipTransformerFactory;
    this.singleFromManyTransformerFactory = singleFromManyTransformerFactory;
    this.loadedDataEndpointFactory = loadedDataEndpointFactory;
  };
  var $MultipleRelationshipDescription = MultipleRelationshipDescription;
  ($traceurRuntime.createClass)(MultipleRelationshipDescription, {
    embeddedEndpoint: function(parent, uriParams) {
      var parentEndpoint = parent.self();
      var transformer;
      if (typeof uriParams == 'string') {
        transformer = this.singleFromManyTransformerFactory(this.name, uriParams);
      } else {
        transformer = this.embeddedRelationshipTransformerFactory(this.name);
      }
      return this.loadedDataEndpointFactory(parentEndpoint, parent, transformer);
    },
    linkedEndpoint: function(parent, uriParams) {
      throw "Error: a many relationships must be embedded";
    }
  }, {}, RelationshipDescription);
  var $__default = MultipleRelationshipDescription;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/relationshipDescriptions/ManyRelationshipDescription',["./MultipleRelationshipDescription", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var MultipleRelationshipDescription = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var ManyRelationshipDescription = function ManyRelationshipDescription() {
    $traceurRuntime.superConstructor($ManyRelationshipDescription).apply(this, arguments);
    ;
  };
  var $ManyRelationshipDescription = ManyRelationshipDescription;
  ($traceurRuntime.createClass)(ManyRelationshipDescription, {}, {}, MultipleRelationshipDescription);
  var $__default = ManyRelationshipDescription;
  Object.defineProperty(ManyRelationshipDescription, "annotations", {get: function() {
      return [new SimpleFactory('ManyRelationshipDescriptionFactory', ['ManyRelationshipInitializerFactory', 'ManyResourceMapperFactory', 'ManyResourceSerializerFactory', 'Inflector', 'EmbeddedRelationshipTransformerFactory', 'SingleFromManyTransformerFactory', 'LoadedDataEndpointFactory'])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/relationshipDescriptions/ListRelationshipDescription',["./RelationshipDescription", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var RelationshipDescription = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var SingleRelationshipDescription = function SingleRelationshipDescription(relationshipInitializerFactory, resourceMapperFactory, resourceSerializerFactory, inflector, singleRelationshipDescriptionFactory, ListResource, primaryResourceTransformerFactory, embeddedRelationshipTransformerFactory, individualFromListTransformerFactory, createResourceTransformerFactory, resolvedEndpointFactory, loadedDataEndpointFactory, templatedUrlFromUrlFactory, templatedUrlFactory, name, ResourceClass, initialValues) {
    $traceurRuntime.superConstructor($SingleRelationshipDescription).call(this, relationshipInitializerFactory, resourceMapperFactory, resourceSerializerFactory, inflector, name, ResourceClass, initialValues);
    this.singleRelationshipDescriptionFactory = singleRelationshipDescriptionFactory;
    this.ListResource = ListResource;
    this.primaryResourceTransformerFactory = primaryResourceTransformerFactory;
    this.embeddedRelationshipTransformerFactory = embeddedRelationshipTransformerFactory;
    this.individualFromListTransformerFactory = individualFromListTransformerFactory;
    this.createResourceTransformerFactory = createResourceTransformerFactory;
    this.resolvedEndpointFactory = resolvedEndpointFactory;
    this.loadedDataEndpointFactory = loadedDataEndpointFactory;
    this.templatedUrlFromUrlFactory = templatedUrlFromUrlFactory;
    this.templatedUrlFactory = templatedUrlFactory;
    this.canCreate = false;
    this._linkTemplatePath = null;
  };
  var $SingleRelationshipDescription = SingleRelationshipDescription;
  ($traceurRuntime.createClass)(SingleRelationshipDescription, {
    get ListResourceClass() {
      return this._ListResourceClass || this.ListResource;
    },
    set ListResourceClass(ListResourceClass) {
      this._ListResourceClass = ListResourceClass;
    },
    get linkTemplate() {
      return this._linkTemplatePath;
    },
    set linkTemplate(linkTemplate) {
      this._linkTemplatePath = ("$.links." + linkTemplate);
    },
    hasParams: function(uriParams) {
      if (typeof uriParams == 'string') {
        uriParams = this.ResourceClass.paramsFromShortLink(uriParams);
      }
      if (typeof uriParams == 'object' && Object.keys(uriParams).length > 0) {
        return uriParams;
      } else {
        return false;
      }
    },
    embeddedEndpoint: function(parent, uriParams) {
      var parentEndpoint = parent.self();
      var transformer;
      uriParams = this.hasParams(uriParams);
      if (uriParams) {
        transformer = this.individualFromListTransformerFactory(this.name, uriParams);
      } else {
        transformer = this.embeddedRelationshipTransformerFactory(this.name);
      }
      return this.loadedDataEndpointFactory(parentEndpoint, parent, transformer);
    },
    listResourceTransformer: function() {
      return this.primaryResourceTransformerFactory(this);
    },
    singleResourceTransformer: function() {
      return this.primaryResourceTransformerFactory(this.singleRelationshipDescriptionFactory("", this.ResourceClass));
    },
    linkedEndpoint: function(parent, uriParams) {
      var transport = parent.self().transport;
      var url,
          templatedUrl,
          primaryResourceTransformer,
          createTransformer;
      var ResourceClass = this.ResourceClass;
      createTransformer = null;
      uriParams = this.hasParams(uriParams);
      if (uriParams && this._linkTemplatePath) {
        url = parent.pathGet(this._linkTemplatePath);
        templatedUrl = this.templatedUrlFactory(url, uriParams);
        primaryResourceTransformer = this.singleResourceTransformer();
      } else {
        url = parent.pathGet(this.linksPath);
        templatedUrl = this.templatedUrlFromUrlFactory(url, url);
        templatedUrl.addDataPathLink(parent, this.linksPath);
        primaryResourceTransformer = this.listResourceTransformer();
        if (this.canCreate) {
          createTransformer = this.createResourceTransformerFactory(this.singleRelationshipDescriptionFactory("", this.ResourceClass));
        }
      }
      var endpoint = this.resolvedEndpointFactory(transport, templatedUrl, primaryResourceTransformer, createTransformer);
      if (createTransformer) {
        endpoint.new = function() {
          return new ResourceClass();
        };
      }
      return endpoint;
    },
    decorateEndpoint: function(endpoint, uriParams) {
      var ResourceClass = this.ResourceClass;
      uriParams = this.hasParams(uriParams);
      if (!uriParams && this.canCreate) {
        endpoint.new = function() {
          return new ResourceClass();
        };
      }
    }
  }, {}, RelationshipDescription);
  var $__default = SingleRelationshipDescription;
  Object.defineProperty(SingleRelationshipDescription, "annotations", {get: function() {
      return [new SimpleFactory('ListRelationshipDescriptionFactory', ['ListRelationshipInitializerFactory', 'ListResourceMapperFactory', 'ListResourceSerializerFactory', 'Inflector', "SingleRelationshipDescriptionFactory", "ListResource", 'PrimaryResourceTransformerFactory', 'EmbeddedRelationshipTransformerFactory', 'IndividualFromListTransformerFactory', 'CreateResourceTransformerFactory', 'ResolvedEndpointFactory', 'LoadedDataEndpointFactory', 'TemplatedUrlFromUrlFactory', 'TemplatedUrlFactory'])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/relationshipDescriptions/MapRelationshipDescription',["./MultipleRelationshipDescription", "../SimpleFactoryInjector"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var MultipleRelationshipDescription = $__0.default;
  var SimpleFactory = $__2.SimpleFactory;
  var MapRelationshipDescription = function MapRelationshipDescription() {
    $traceurRuntime.superConstructor($MapRelationshipDescription).apply(this, arguments);
    ;
  };
  var $MapRelationshipDescription = MapRelationshipDescription;
  ($traceurRuntime.createClass)(MapRelationshipDescription, {}, {}, MultipleRelationshipDescription);
  var $__default = MapRelationshipDescription;
  Object.defineProperty(MapRelationshipDescription, "annotations", {get: function() {
      return [new SimpleFactory('MapRelationshipDescriptionFactory', ['MapRelationshipInitializerFactory', 'MapResourceMapperFactory', 'MapResourceSerializerFactory', 'Inflector', 'EmbeddedRelationshipTransformerFactory', 'SingleFromManyTransformerFactory', 'LoadedDataEndpointFactory'])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/relationshipDescriptions',["./relationshipDescriptions/SingleRelationshipDescription", "./relationshipDescriptions/ManyRelationshipDescription", "./relationshipDescriptions/ListRelationshipDescription", "./relationshipDescriptions/MapRelationshipDescription"], function($__0,$__1,$__2,$__3) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__1 || !$__1.__esModule)
    $__1 = {default: $__1};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__3 || !$__3.__esModule)
    $__3 = {default: $__3};
  var $__relationshipDescriptions_47_SingleRelationshipDescription_46_js__ = $__0;
  var $__relationshipDescriptions_47_ManyRelationshipDescription_46_js__ = $__1;
  var $__relationshipDescriptions_47_ListRelationshipDescription_46_js__ = $__2;
  var $__relationshipDescriptions_47_MapRelationshipDescription_46_js__ = $__3;
  return {
    get SingleRelationshipDescription() {
      return $__relationshipDescriptions_47_SingleRelationshipDescription_46_js__.default;
    },
    get ManyRelationshipDescription() {
      return $__relationshipDescriptions_47_ManyRelationshipDescription_46_js__.default;
    },
    get ListRelationshipDescription() {
      return $__relationshipDescriptions_47_ListRelationshipDescription_46_js__.default;
    },
    get MapRelationshipDescription() {
      return $__relationshipDescriptions_47_MapRelationshipDescription_46_js__.default;
    },
    __esModule: true
  };
});

define('relayer/ListResource',["./Resource", "a1atscript"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Resource = $__0.default;
  var Value = $__2.Value;
  var ListResource = function ListResource() {
    $traceurRuntime.superConstructor($ListResource).apply(this, arguments);
    ;
  };
  var $ListResource = ListResource;
  ($traceurRuntime.createClass)(ListResource, {}, {}, Resource);
  var $__default = ListResource;
  Object.defineProperty(ListResource, "annotations", {get: function() {
      return [new Value('ListResource')];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/PrimaryResourceBuilder',["./SimpleFactoryInjector"], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var SimpleFactory = $__0.SimpleFactory;
  var PrimaryResourceBuilder = function PrimaryResourceBuilder(response, ResourceClass) {
    this.response = response;
    this.ResourceClass = ResourceClass;
  };
  ($traceurRuntime.createClass)(PrimaryResourceBuilder, {build: function(endpoint) {
      var resource = new this.ResourceClass(this.response);
      resource.templatedUrl = endpoint.templatedUrl;
      resource.templatedUrl.addDataPathLink(resource, "$.links.self");
      resource.self = function() {
        return endpoint;
      };
      return resource;
    }}, {});
  var $__default = PrimaryResourceBuilder;
  Object.defineProperty(PrimaryResourceBuilder, "annotations", {get: function() {
      return [new SimpleFactory("PrimaryResourceBuilderFactory", [])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/ResourceBuilder',["./SimpleFactoryInjector"], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var SimpleFactory = $__0.SimpleFactory;
  var ResourceBuilder = function ResourceBuilder(templatedUrlFromUrlFactory, resolvedEndpointFactory, throwErrorTransformerFactory, transport, response, primaryResourceTransformer, ResourceClass) {
    this.transport = transport;
    this.ResourceClass = ResourceClass;
    this.templatedUrlFromUrlFactory = templatedUrlFromUrlFactory;
    this.resolvedEndpointFactory = resolvedEndpointFactory;
    this.throwErrorTransformerFactory = throwErrorTransformerFactory;
    this.response = response;
    this.primaryResourceTransformer = primaryResourceTransformer;
  };
  ($traceurRuntime.createClass)(ResourceBuilder, {build: function() {
      var uriTemplate = arguments[0] !== (void 0) ? arguments[0] : null;
      var resource = new this.ResourceClass(this.response);
      if (resource.pathGet("$.links.self")) {
        if (uriTemplate) {
          resource.templatedUrl = this.templatedUrlFromUrlFactory(uriTemplate, resource.pathGet("$.links.self"));
        } else {
          resource.templatedUrl = this.templatedUrlFromUrlFactory(resource.pathGet("$.links.self"), resource.pathGet("$.links.self"));
        }
        resource.templatedUrl.addDataPathLink(resource, "$.links.self");
        var createResourceTransformer = this.throwErrorTransformerFactory();
        var endpoint = this.resolvedEndpointFactory(this.transport, resource.templatedUrl, this.primaryResourceTransformer, createResourceTransformer);
        resource.self = function() {
          return endpoint;
        };
      }
      return resource;
    }}, {});
  var $__default = ResourceBuilder;
  Object.defineProperty(ResourceBuilder, "annotations", {get: function() {
      return [new SimpleFactory("ResourceBuilderFactory", ["TemplatedUrlFromUrlFactory", "ResolvedEndpointFactory", "ThrowErrorTransformerFactory"])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/Transport',["./SimpleFactoryInjector"], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var SimpleFactory = $__0.SimpleFactory;
  var Transport = function Transport(urlHelper, $http) {
    this.http = $http;
    this.urlHelper = urlHelper;
  };
  ($traceurRuntime.createClass)(Transport, {
    get: function(url) {
      var etag = arguments[1] !== (void 0) ? arguments[1] : null;
      var getParams = {
        method: "GET",
        url: this.urlHelper.fullUrl(url)
      };
      if (etag) {
        getParams.headers = {};
        getParams.headers['If-None-Match'] = etag;
      }
      return this.resolve(this.http(getParams));
    },
    put: function(url, data) {
      var etag = arguments[2] !== (void 0) ? arguments[2] : null;
      var putParams = {
        method: "PUT",
        url: this.urlHelper.fullUrl(url),
        data: data
      };
      if (etag) {
        putParams.headers = {};
        putParams.headers['If-Match'] = etag;
      }
      return this.resolve(this.http(putParams));
    },
    post: function(url, data) {
      return this.resolve(this.http({
        method: "POST",
        url: this.urlHelper.fullUrl(url),
        data: data
      }));
    },
    delete: function(url) {
      return this.resolve(this.http({
        method: 'DELETE',
        url: this.urlHelper.fullUrl(url)
      }));
    },
    resolve: function(backendResponds) {
      var $__2 = this;
      return backendResponds.then((function(fullResponse) {
        if (fullResponse.status === 201 && fullResponse.headers().location) {
          var locationUrl = $__2.absolutizeResponseLocation(fullResponse);
          return $__2.get(locationUrl);
        } else {
          var response = {};
          response.data = fullResponse.data;
          response.etag = fullResponse.headers().ETag;
          return response;
        }
      }), (function(errorResponse) {
        throw errorResponse;
      }));
    },
    absolutizeResponseLocation: function(fullResponse) {
      return this.urlHelper.checkLocationUrl(fullResponse.headers().location, fullResponse.config.url);
    }
  }, {});
  var $__default = Transport;
  Object.defineProperty(Transport, "annotations", {get: function() {
      return [new SimpleFactory('TransportFactory', [])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/UrlHelper',["./SimpleFactoryInjector"], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var SimpleFactory = $__0.SimpleFactory;
  var UrlHelper = function UrlHelper(baseUrl) {
    if (this.isFullUrl(baseUrl)) {
      baseUrl = this.fullUrlRegEx.exec(baseUrl)[1];
    }
    this.baseUrl = this.withoutTrailingSlash(baseUrl);
  };
  ($traceurRuntime.createClass)(UrlHelper, {
    mangleUrl: function(url) {
      if (url) {
        return url.replace(/^\//, '');
      }
    },
    fullUrl: function(url) {
      if (this.isFullUrl(url)) {
        return url;
      } else {
        return (this.baseUrl + "/" + this.mangleUrl(url));
      }
    },
    get fullUrlRegEx() {
      return new RegExp('(([A-Za-z]+:)?//[^/]+)(/.*)');
    },
    isFullUrl: function(url) {
      return this.fullUrlRegEx.test(url);
    },
    withoutTrailingSlash: function(url) {
      if (url) {
        return (/\/$/.test(url) ? url.substring(0, url.length - 1) : url);
      }
    },
    checkLocationUrl: function(respUrl, reqUrl) {
      if (this.isFullUrl(respUrl)) {
        return respUrl;
      } else {
        return this.fullUrlRegEx.exec(reqUrl)[1] + respUrl;
      }
    }
  }, {});
  var $__default = UrlHelper;
  Object.defineProperty(UrlHelper, "annotations", {get: function() {
      return [new SimpleFactory('UrlHelperFactory', [])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/Promise',["a1atscript"], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Factory = $__0.Factory;
  var RelayerPromise = function RelayerPromise(resolver) {
    this.internalPromise = RelayerPromiseFactory.$q(resolver);
  };
  var $RelayerPromise = RelayerPromise;
  ($traceurRuntime.createClass)(RelayerPromise, {
    then: function(onFulfilled, onRejected, progressBack) {
      return this.internalPromise.then(onFulfilled, onRejected, progressBack);
    },
    catch: function(callback) {
      return this.internalPromise.catch(callback);
    },
    finally: function(callback, progressBack) {
      return this.internalPromise.finally(callback, progressBack);
    }
  }, {
    resolve: function(value) {
      return new $RelayerPromise((function(res, rej) {
        return res(value);
      }));
    },
    reject: function(value) {
      return new $RelayerPromise((function(res, rej) {
        return rej(value);
      }));
    }
  });
  var RelayerPromiseFactory = function RelayerPromiseFactory() {
    ;
  };
  var $RelayerPromiseFactory = RelayerPromiseFactory;
  ($traceurRuntime.createClass)(RelayerPromiseFactory, {}, {factory: function($q) {
      $RelayerPromiseFactory.$q = $q;
      return RelayerPromise;
    }});
  var $__default = RelayerPromiseFactory;
  Object.defineProperty(RelayerPromiseFactory.factory, "annotations", {get: function() {
      return [new Factory('RelayerPromise', ['$q'])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer/RelationshipUtilities',["a1atscript", "./TemplatedUrl"], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Service = $__0.Service;
  var TemplatedUrl = $__2.TemplatedUrl;
  var RelationshipUtilities = function RelationshipUtilities() {
    ;
  };
  ($traceurRuntime.createClass)(RelationshipUtilities, {addMethods: function(target, resource, name) {
      target.get = function() {
        return resource.relationships[name];
      };
      target.present = function() {
        return resource.relationships[name] ? true : false;
      };
      target.set = function(newRelationship) {
        var linksPath = resource.constructor.relationships[name].linksPath;
        if (resource.relationships[name] instanceof TemplatedUrl) {
          resource.relationships[name].removeDataPathLink(resource, linksPath);
          if (!newRelationship) {
            resource.pathSet(linksPath, "");
          }
        }
        if (newRelationship instanceof TemplatedUrl) {
          newRelationship.addDataPathLink(resource, linksPath, false);
        }
        resource.relationships[name] = newRelationship;
        if (!resource.relationships[name]) {
          delete resource.relationships[name];
        }
      };
    }}, {});
  var $__default = RelationshipUtilities;
  Object.defineProperty(RelationshipUtilities, "annotations", {get: function() {
      return [new Service('RelationshipUtilities')];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('xing-inflector',["a1atscript"], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var $__1 = $__0,
      AsModule = $__1.AsModule,
      Service = $__1.Service;
  var Inflector = function Inflector() {
    ;
  };
  ($traceurRuntime.createClass)(Inflector, {
    camelize: function(key) {
      if (!angular.isString(key)) {
        return key;
      }
      return key.replace(/_[\w\d]/g, function(match, index, string) {
        return index === 0 ? match : string.charAt(index + 1).toUpperCase();
      });
    },
    humanize: function(key) {
      if (!angular.isString(key)) {
        return key;
      }
      return key.replace(/_/g, ' ').replace(/(\w+)/g, function(match) {
        return match.charAt(0).toUpperCase() + match.slice(1);
      });
    },
    underscore: function(key) {
      if (!angular.isString(key)) {
        return key;
      }
      return key.replace(/[A-Z]/g, function(match, index) {
        return index === 0 ? match : '_' + match.toLowerCase();
      });
    },
    dasherize: function(key) {
      if (!angular.isString(key)) {
        return key;
      }
      return key.replace(/[A-Z]/g, function(match, index) {
        return index === 0 ? match : '-' + match.toLowerCase();
      });
    },
    pluralize: function(value) {
      return value + 's';
    }
  }, {});
  var $__default = Inflector;
  Object.defineProperty(Inflector, "annotations", {get: function() {
      return [new AsModule('inflector'), new Service('Inflector')];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define('relayer',["./relayer/ResourceDescription", "./relayer/Resource", "./relayer/endpoints", "./relayer/serializers", "./relayer/mappers", "./relayer/transformers", "./relayer/initializers", "./relayer/decorators", "./relayer/relationshipDescriptions", "./relayer/ListResource", "./relayer/PrimaryResourceBuilder", "./relayer/ResourceBuilder", "./relayer/Transport", "./relayer/UrlHelper", "./relayer/TemplatedUrl", "./relayer/Promise", "./relayer/RelationshipUtilities", "a1atscript", "xing-inflector"], function($__0,$__2,$__4,$__5,$__6,$__7,$__8,$__9,$__10,$__11,$__13,$__15,$__17,$__19,$__21,$__22,$__24,$__26,$__28) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__5 || !$__5.__esModule)
    $__5 = {default: $__5};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  if (!$__7 || !$__7.__esModule)
    $__7 = {default: $__7};
  if (!$__8 || !$__8.__esModule)
    $__8 = {default: $__8};
  if (!$__9 || !$__9.__esModule)
    $__9 = {default: $__9};
  if (!$__10 || !$__10.__esModule)
    $__10 = {default: $__10};
  if (!$__11 || !$__11.__esModule)
    $__11 = {default: $__11};
  if (!$__13 || !$__13.__esModule)
    $__13 = {default: $__13};
  if (!$__15 || !$__15.__esModule)
    $__15 = {default: $__15};
  if (!$__17 || !$__17.__esModule)
    $__17 = {default: $__17};
  if (!$__19 || !$__19.__esModule)
    $__19 = {default: $__19};
  if (!$__21 || !$__21.__esModule)
    $__21 = {default: $__21};
  if (!$__22 || !$__22.__esModule)
    $__22 = {default: $__22};
  if (!$__24 || !$__24.__esModule)
    $__24 = {default: $__24};
  if (!$__26 || !$__26.__esModule)
    $__26 = {default: $__26};
  if (!$__28 || !$__28.__esModule)
    $__28 = {default: $__28};
  var $__1 = $__0,
      describeResource = $__1.describeResource,
      InitializedResourceClasses = $__1.InitializedResourceClasses,
      ResourceDescription = $__1.ResourceDescription;
  var Resource = $__2.default;
  var Endpoints = $__4;
  var Serializers = $__5;
  var Mappers = $__6;
  var Transformers = $__7;
  var Initializers = $__8;
  var Decorators = $__9;
  var RelationshipDescriptions = $__10;
  var ListResource = $__11.default;
  var PrimaryResourceBuilder = $__13.default;
  var ResourceBuilder = $__15.default;
  var Transport = $__17.default;
  var UrlHelper = $__19.default;
  var TemplatedUrls = $__21;
  var RelayerPromiseFactory = $__22.default;
  var RelationshipUtilities = $__24.default;
  var $__27 = $__26,
      AsModule = $__27.AsModule,
      Provider = $__27.Provider;
  var Inflector = $__28.default;
  var ResourceLayer = function ResourceLayer($provide) {
    var $__30 = this;
    this.apis = {};
    this.$provide = $provide;
    this.$get = ['$injector', (function($injector) {
      var builtApis = {};
      Object.keys($__30.apis).forEach((function(apiName) {
        buildApis[apiName] = $injector.get(apiName);
      }));
      return buildApis;
    })];
  };
  ($traceurRuntime.createClass)(ResourceLayer, {createApi: function(apiName, topLevelResource, baseUrl) {
      this.apis[apiName] = {
        topLevelResource: topLevelResource,
        baseUrl: baseUrl
      };
      this.$provide.factory(apiName, ['UrlHelperFactory', 'TransportFactory', 'TemplatedUrlFromUrlFactory', 'ResolvedEndpointFactory', 'PrimaryResourceTransformerFactory', 'SingleRelationshipDescriptionFactory', '$http', 'InitializedResourceClasses', function(urlHelperFactory, transportFactory, templatedUrlFromUrlFactory, resolvedEndpointFactory, primaryResourceTransformerFactory, singleRelationshipDescriptionFactory, $http, initializedResourceClasses) {
        var urlHelper = urlHelperFactory(baseUrl);
        var wellKnownUrl = urlHelper.fullUrlRegEx.exec(baseUrl)[3];
        var transport = transportFactory(urlHelper, $http);
        var templatedUrl = templatedUrlFromUrlFactory(wellKnownUrl, wellKnownUrl);
        var transformer = primaryResourceTransformerFactory(singleRelationshipDescriptionFactory("", topLevelResource));
        var endpoint = resolvedEndpointFactory(transport, templatedUrl, transformer);
        topLevelResource.resourceDescription.applyToEndpoint(endpoint);
        return endpoint;
      }]);
    }}, {
    get Resource() {
      return Resource;
    },
    get ListResource() {
      return ListResource;
    },
    get Describe() {
      return describeResource;
    }
  });
  var $__default = ResourceLayer;
  Object.defineProperty(ResourceLayer, "annotations", {get: function() {
      return [new AsModule('relayer', [Endpoints, Serializers, Mappers, Transformers, Initializers, Decorators, RelationshipDescriptions, ListResource, PrimaryResourceBuilder, ResourceBuilder, Transport, UrlHelper, TemplatedUrls, ResourceDescription, InitializedResourceClasses, ResourceBuilder, PrimaryResourceBuilder, Inflector, RelayerPromiseFactory, RelationshipUtilities]), new Provider('relayer', ['$provide'])];
    }});
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

