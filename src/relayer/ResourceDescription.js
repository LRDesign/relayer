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

  get jsonPropertyDecoratorFactory()         { return this.applySelfToBuilder(Decs.JsonPropertyDecorator); }
  get relatedResourceDecoratorFactory()      { return this.applySelfToBuilder(Decs.RelatedResourceDecorator); }

  get singleRelationshipDescriptionFactory() { return this.applySelfToBuilder(RelDescs.SingleRelationshipDescription); }
  get manyRelationshipDescriptionFactory()   { return this.applySelfToBuilder(RelDescs.ManyRelationshipDescription); }
  get listRelationshipDescriptionFactory ()  { return this.applySelfToBuilder(RelDescs.ListRelationshipDescription); }
  get mapRelationshipDescriptionFactory ()   { return this.applySelfToBuilder(RelDescs.MapRelationshipDescription); }

  chainFrom(other){
    if(this.parentDescription && this.parentDescription !== other){
      throw new Error("Attempted to rechain description: existing parent is of " +
                      `${this.parentDescription.ResourceClass}, new is of ${other.ResourceClass}`);
    } else {
      this.parentDescription = other;
    }
  }

  requiredFields(contextName, object){
    var missing = [];
    for(let name in object){
      if(!object[name]){
        missing.push(name);
      }
    }

    if(missing.length > 0){
      var message = `${contextName}(${JSON.stringify(object)}) requires a value for each of: ${missing.join(", ")}`;
      throw new Error(message);
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
    this.requiredFields("property", {property});
    this.jsonProperty(property, `$.data.${this.inflector.underscore(property)}`, initial);
  }

  jsonProperty(name, path, value, options) {
    this.requiredFields("jsonProperty", {name, path});
    return this.recordDecorator(name, this.jsonPropertyDecoratorFactory(name, path, value, options));
  }

  hasOne(property, rezClass, initialValues){
    this.requiredFields("hasOne", {property, rezClass});
    return this.relatedResource(property, rezClass, initialValues, this.singleRelationshipDescriptionFactory);
  }

  hasMany(property, rezClass, initialValues) {
    this.requiredFields("hasMany", {property, rezClass});
    return this.relatedResource(property, rezClass, initialValues, this.manyRelationshipDescriptionFactory);
  }

  hasList(property, rezClass, initialValues) {
    this.requiredFields("hasList", {property, rezClass});
    return this.relatedResource(property, rezClass, initialValues, this.listRelationshipDescriptionFactory);
  }

  hasMap(property, rezClass, initialValue){
    this.requiredFields("hasMap", {property, rezClass});
    return this.relatedResource(property, rezClass, initialValue, this.mapRelationshipDescriptionFactory);
  }

}
