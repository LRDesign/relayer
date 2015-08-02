import APIError from "./APIError.js"
import {Service} from 'a1atscript'
import {SimpleFactory} from "./SimpleFactoryInjector.js"

var resourcesToInitialize = [];

export function describeResource(resourceClass, defineFn){
  resourcesToInitialize.push({resourceClass, defineFn});
}

@Service('InitializedResourceClasses', ['ResourceDescriptionFactory'])
export class InitializedResourceClasses {
  constructor(resourceDescriptionFactory) {
    this.resourceDescriptionFactory = resourceDescriptionFactory;
    this.initializeClasses();
  }

  initializeClasses() {
    resourcesToInitialize.forEach((resourceToInitialize) => {
      var resourceClass = resourceToInitialize.resourceClass;
      var defineFn = resourceToInitialize.defineFn;
      var resourceDescription = resourceClass.description(this.resourceDescriptionFactory);
      // wrap-around definitions because...
      defineFn(resourceDescription);

    });

    return resourcesToInitialize.map((resourceToInitialize) => {
      var resourceClass = resourceToInitialize.resourceClass;
      var resourceDescription = resourceClass.resourceDescription;
      var errorClass = function (responseData) {
        APIError.call(this);
      }
      errorClass.relationships = {};
      errorClass.prototype = Object.create(APIError.prototype);
      errorClass.prototype.constructor = errorClass;
      resourceDescription.applyToResource(resourceClass.prototype);
      resourceDescription.applyToError(errorClass.prototype);
      resourceClass.errorClass = errorClass;
      return resourceClass;
    });
  }
}

@SimpleFactory('ResourceDescriptionFactory', ['JsonPropertyDecoratorFactory',
  'RelatedResourceDecoratorFactory',
  'SingleRelationshipDescriptionFactory',
  'ManyRelationshipDescriptionFactory',
  'ListRelationshipDescriptionFactory',
  'MapRelationshipDescriptionFactory',
  'Inflector'])
export class ResourceDescription {

  constructor(jsonPropertyDecoratorFactory,
    relatedResourceDecoratorFactory,
    singleRelationshipDescriptionFactory,
    manyRelationshipDescriptionFactory,
    listRelationshipDescriptionFactory,
    mapRelationshipDescriptionFactory,
    inflector) {

    this.jsonPropertyDecoratorFactory = jsonPropertyDecoratorFactory;
    this.relatedResourceDecoratorFactory = relatedResourceDecoratorFactory;
    this.singleRelationshipDescriptionFactory = singleRelationshipDescriptionFactory;
    this.manyRelationshipDescriptionFactory = manyRelationshipDescriptionFactory;
    this.listRelationshipDescriptionFactory = listRelationshipDescriptionFactory;
    this.mapRelationshipDescriptionFactory = mapRelationshipDescriptionFactory;
    this.inflector = inflector;

    // XXX decorators (by name) never used except to record them
    this.decorators = {};
    this.allDecorators = [];
    this.parentDescription = null; //automated inheritance?
  }

  chainFrom(other){
    if(this.parentDescription && this.parentDescription !== other){
      throw new Error("Attempted to rechain description: existing parent if of " +
                      `${this.parentDescription.ResourceClass}, new is of ${other.ResourceClass}`);
    } else {
      this.parentDescription = other;
    }
  }

  recordDecorator(name, decoratorDescription) {
    this.decorators[name] = this.decorators[name] || [];
    this.decorators[name].push(decoratorDescription);
    this.allDecorators.push(decoratorDescription);
    return decoratorDescription;
  }

  applyToResource(resource){
    this.allDecorators.forEach((decorator) => {
      decorator.resourceApply(resource);
    });
    if (this.parentDescription) {
      this.parentDescription.applyToResource(resource);
    }
  }

  applyToError(error){
    this.allDecorators.forEach((decorator) => {
      decorator.errorsApply(error);
    });
    if (this.parentDescription) {
      this.parentDescription.applyToError(error);
    }
  }

  applyToEndpoint(endpoint){
    this.allDecorators.forEach((decorator) => {
      decorator.endpointApply(endpoint);
    });
    if (this.parentDescription) {
      this.parentDescription.applyToEndpoint(endpoint);
    }
  }

  property(property, initial){
    this.jsonProperty(property, `$.data.${this.inflector.underscore(property)}`, initial);
  }

  hasOne(property, rezClass, initialValues){
    return this.relatedResource(property, rezClass, initialValues, this.singleRelationshipDescriptionFactory)
  }

  hasMany(property, rezClass, initialValues) {
    return this.relatedResource(property, rezClass, initialValues, this.manyRelationshipDescriptionFactory)
  }

  hasList(property, rezClass, initialValues) {
    return this.relatedResource(property, rezClass, initialValues, this.listRelationshipDescriptionFactory)
  }

  hasMap(property, rezClass, initialValue){
    return this.relatedResource(property, rezClass, initialValue, this.mapRelationshipDescriptionFactory)
  }

  jsonProperty(name, path, value, options) {
    return this.recordDecorator(name, this.jsonPropertyDecoratorFactory(name, path, value, options));
  }

  relatedResource(property, rezClass, initialValues, relationshipDescriptionFactory){
    var relationship = relationshipDescriptionFactory(property, rezClass, initialValues);
    //XXX "name" appears to be copypasta - but it works?
    this.recordDecorator(name, this.relatedResourceDecoratorFactory(property, relationship));
    return relationship;
  }

}
