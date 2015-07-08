import {SimpleFactory} from "../src/relayer/SimpleFactoryInjector.js";
import {Module, Injector} from "a1atscript";

@SimpleFactory('DependentFactory')
class Dependent {
  constructor(awesome) {
    this.awesome = awesome;
  }
}

@SimpleFactory('TopLevelFactory', ['DependentFactory'])
class TopLevel {
  constructor(dependentFactory, cheese) {
    this.cheese = cheese;
    this.dependent = dependentFactory(cheese);
  }
}

var AppModule = new Module('AppModule', [Dependent, TopLevel])
describe("SimpleFactory", function() {
  var topLevel;

  beforeEach(function() {
    var injector = new Injector();
    injector.instantiate(AppModule);
    angular.mock.module('AppModule');
    inject(['TopLevelFactory', function(topLevelFactory) {
      topLevel = topLevelFactory("gouda");
    }]);
  });

  it("should setup factories that build classes", function() {
    expect(topLevel).toEqual(jasmine.any(TopLevel));
  });

  it("should pass factory parameters to the class constructor", function() {
    expect(topLevel.cheese).toEqual("gouda");
  });

  it("should inject class constructors with dependencies for the factory", function() {
    expect(topLevel.dependent).toEqual(jasmine.any(Dependent));
    expect(topLevel.dependent.awesome).toEqual("gouda");
  });
});
