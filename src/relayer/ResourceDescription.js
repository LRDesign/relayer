import APIError from "./APIError.js";

import {factory as jsonPropertyDecoratorFactory} from "./decorators/JsonPropertyDecorator.js";
import {factory as relatedResourceDecoratorFactory} from "./decorators/RelatedResourceDecorator.js";
import {factory as singleRelationshipDescriptionFactory} from "./relationshipDescriptions/SingleRelationshipDescription.js";
import {factory as manyRelationshipDescriptionFactory} from "./relationshipDescriptions/ManyRelationshipDescription.js";
import {factory as listRelationshipDescriptionFactory} from "./relationshipDescriptions/ListRelationshipDescription.js";
import {factory as mapRelationshipDescriptionFactory} from "./relationshipDescriptions/MapRelationshipDescription.js";
import inflector from "./singletons/Inflector.js";

export function factory() {
  return new ResourceDescription(jsonPropertyDecoratorFactory,
                                 relatedResourceDecoratorFactory,
                                 singleRelationshipDescriptionFactory,
                                 manyRelationshipDescriptionFactory,
                                 listRelationshipDescriptionFactory,
                                 mapRelationshipDescriptionFactory,
                                 inflector);
}

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

  jsonProperty(name, path, value, options) {
    return this.recordDecorator(name, this.jsonPropertyDecoratorFactory(name, path, value, options));
  }

  relatedResource(property, rezClass, initialValues, relationshipDescriptionFactory){
    var relationship = relationshipDescriptionFactory(property, rezClass, initialValues);
    this.recordDecorator(name, this.relatedResourceDecoratorFactory(property, relationship));
    return relationship;
  }

}
