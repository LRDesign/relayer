import ResourceDecorator from "./ResourceDecorator.js";
import {SimpleFactory} from "../SimpleFactoryInjector.js";

@SimpleFactory('JsonPropertyDecoratorFactory', ['LoadedDataEndpointFactory',
  'EmbeddedPropertyTransformerFactory',
  'PromiseEndpointFactory'])
export default class JsonPropertyDecorator extends ResourceDecorator {
  constructor(loadedDataEndpointFactory,
    embeddedPropertyTransformerFactory,
    promiseEndpointFactory,
    name,
    path,
    value,
    options){

    super(name);

    this.path = path;
    this.options = options || {};
    this.loadedDataEndpointFactory = loadedDataEndpointFactory;
    this.embeddedPropertyTransformerFactory = embeddedPropertyTransformerFactory;
    this.promiseEndpointFactory = promiseEndpointFactory;
    this.value = value;
  }

  recordApply(target){
    target.constructor.properties[this.name] = this.path;
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
  }

  resourceApply(resource) {
    if (this.value !== undefined) {
      resource.setInitialValue(this.path, this.value);
    }
    this.recordApply(resource);
  }

  errorsApply(errors){
    this.recordApply(errors);
  }

  get endpointFn() {

    if(!this._endpointFn){

      var path = this.path;
      var promiseEndpointFactory = this.promiseEndpointFactory;
      var loadedDataEndpointFactory = this.loadedDataEndpointFactory;
      var embeddedPropertyTransformerFactory = this.embeddedPropertyTransformerFactory;
      this._endpointFn = function(uriParams = {}){
        // 'this' in here = Endpoint

        var newPromise = () => {
          return this.load().then((resource) => {
            return loadedDataEndpointFactory(resource.self(),
              resource,
              [embeddedPropertyTransformerFactory(path)]);
          });
        }

        var newEndpoint = promiseEndpointFactory(newPromise);

        return newEndpoint;

      };
    }

    return this._endpointFn;
  }

  endpointApply(target) {
    this.addFunction(target, this.endpointFn);
  }
}

/*
export default class JsonPropertyTransform extends ResourceTransform {
  static get transformArguments() {
    return ["property", "jsonPath", "initial"]
  }

  transform(property, jsonPath, initial = undefined) {
    this.ResourceClass.prototype.defineJsonProperty(property, jsonPath);
    this.ResourceClass.prototype.addInitialValue(property, initial);
  }

  // WIP this would generate the promise version of calling this property, not tested
  static promiseCall(transformDescription) {
    return (results) => results[transformDescription.property];
  }
}
*/
