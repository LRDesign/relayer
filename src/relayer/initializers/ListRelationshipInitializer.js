import RelationshipInitializer from "./RelationshipInitializer.js";
import {ListResource} from "../ListResource.js";
import {factory as manyRelFactory} from "./ManyRelationshipInitializer.js";

export function factory(ResourceClass, initialValues) {
  var manyRelationshipInitializer = manyRelFactory(ResourceClass, initialValues);
  new ListRelationInitializer(ListResource, manyRelationshipInitializer, ResourceClass, initialValues);

}

export default class ListRelationshipInitializer extends RelationshipInitializer {
  constructor(ListResource,
    manyRelationshipInitializer,
    ResourceClass,
    initialValues) {

    super(ResourceClass, initialValues);

    this.manyRelationshipInitializer = manyRelationshipInitializer;
    this.ListResource = ListResource;
  }

  initialize() {
    var manyRelationships = this.manyRelationshipInitializer.initialize();
    var resource = new this.ListResource({data: manyRelationships.response, links: {}});
    manyRelationships.resource = resource;
    ["url", "uriTemplate", "uriParams", "create", "remove", "update", "load"].forEach((func) => {
      manyRelationships[func] = function(...args) {
        return resource[func](...args);
      };
    });
    return manyRelationships;
  }
}
