import Locator       from "./Locator.js";
import * as Decs     from "./decorators.js";
import * as RelDescs from "./relationshipDescriptions.js";

export default class ResourceDescription extends Locator {
  constructor(inflector) {
    super();
    this.inflector         = inflector;
    this.decorators        = {};
    this.allDecorators     = [];
    this.parentDescription = null; //automated inheritance?
  }

  get jsonPropertyDecoratorFactory()         { return (...args) => this.injectSelf(Decs.JsonPropertyDecorator, ...args); }
  get relatedResourceDecoratorFactory()      { return (...args) => this.injectSelf(Decs.RelatedResourceDecorator, ...args); }

  get singleRelationshipDescriptionFactory() { return (...args) => this.injectSelf(RelDescs.SingleRelationshipDescription, ...args); }
  get manyRelationshipDescriptionFactory()   { return (...args) => this.injectSelf(RelDescs.ManyRelationshipDescription, ...args); }
  get listRelationshipDescriptionFactory ()  { return (...args) => this.injectSelf(RelDescs.ListRelationshipDescription, ...args); }
  get mapRelationshipDescriptionFactory ()   { return (...args) => this.injectSelf(RelDescs.MapRelationshipDescription, ...args); }

  chainFrom(other){
    if(this.parentDescription && this.parentDescription !== other){
      throw new Error("Attempted to rechain description: existing parent is of " +
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

  relatedResource(property, rezClass, initialValues, relationshipDescriptionFactory){
    var relationship = relationshipDescriptionFactory(property, rezClass, initialValues);
    this.recordDecorator(name, this.relatedResourceDecoratorFactory(property, relationship));
    return relationship;
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

  jsonProperty(name, path, value, options) {
    return this.recordDecorator(name, this.jsonPropertyDecoratorFactory(name, path, value, options));
  }

  hasOne(property, rezClass, initialValues){
    return this.relatedResource(property, rezClass, initialValues, this.singleRelationshipDescriptionFactory);
  }

  hasMany(property, rezClass, initialValues) {
    return this.relatedResource(property, rezClass, initialValues, this.manyRelationshipDescriptionFactory);
  }

  hasList(property, rezClass, initialValues) {
    return this.relatedResource(property, rezClass, initialValues, this.listRelationshipDescriptionFactory);
  }

  hasMap(property, rezClass, initialValue){
    return this.relatedResource(property, rezClass, initialValue, this.mapRelationshipDescriptionFactory);
  }

}
