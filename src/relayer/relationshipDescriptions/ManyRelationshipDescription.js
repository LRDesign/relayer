import {default as MultipleRelationshipDescription, partialFactory as multipleFactory} from "./MultipleRelationshipDescription.js";

export function factory(name, ResourceClass, initialValues) {
  return multipleFactory(name, ResourceClass, initialValues, (...args) => {
    return new ManyRelationshipsDescription(...args);
  });
}

export default class ManyRelationshipDescription extends MultipleRelationshipDescription { }
