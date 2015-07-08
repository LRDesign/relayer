import {registerInjector, ToAnnotation} from 'a1atscript'

@ToAnnotation
export class SimpleFactory {
  constructor(token, dependencies = []) {
    this.token = token;
    this.dependencies = dependencies;
  }
}

// this converts a class into a factory function which adds depedencies as
// initial parameters to the constructor
export class SimpleFactoryInjector {
  get annotationClass() {
    return SimpleFactory;
  }

  instantiate(module, dependencyList) {
    dependencyList.forEach((dependencyObject) => {
      this.instantiateOne(module, dependencyObject.dependency, dependencyObject.metadata);
    });
  }

  instantiateOne(module, FactoryClass, metadata) {
    var injector = this;
    var factory = function(...passedDependencies) {
      return function(...args) {
          var newArgs = passedDependencies.concat(args);
          var builtObject = new FactoryClass(...newArgs);
          return builtObject;
      }
    }
    factory['$inject'] = metadata.dependencies;
    module.factory(metadata.token, factory);
  }
}

registerInjector('simpleFactory', SimpleFactoryInjector);
