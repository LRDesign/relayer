import {default as RelationshipInitializer, partialFactory as superFactory} from "./RelationshipInitializer.js";

export function factory(ResourceClass, initialValues) {
  return partialFactory(ResourceClass, initialValues, (...args) => {
    return new SingleRelationshipInitializer(...args);
  });
}

export default class SingleRelationshipInitializer extends RelationshipInitializer {
  initialize() {
    var relationship = new this.ResourceClass();
    if (this.initialValues) {
      Object.keys(this.initialValues).forEach((property) => {
        relationship[property] = this.initialValues[property];
      });
    }
    return relationship;
  }
}
