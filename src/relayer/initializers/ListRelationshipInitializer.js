import RelationshipInitializer from "./RelationshipInitializer.js";
import {ListResource} from "../ListResource.js";
import ManyRelationshipInitializer from "./ManyRelationshipInitializer.js";
import makeFac from "../dumbMetaFactory.js";

export default class ListRelationshipInitializer extends RelationshipInitializer {
  constructor(
    ResourceClass,
    initialValues,
    ListResourceFactory = makeFac(ListResource),
    manyRelationshipInitializer = new ManyRelationshipInitializer(ResourceClass, initialValues)
  ) {

    super(ResourceClass, initialValues);

    this.manyRelationshipInitializer = manyRelationshipInitializer;
    this.ListResourceFac = ListResourceFactory;
  }

  initialize() {
    var manyRelationships = this.manyRelationshipInitializer.initialize();
    var resource = this.ListResourceFac({data: manyRelationships.response, links: {}});
    manyRelationships.resource = resource;
    ["url", "uriTemplate", "uriParams", "create", "remove", "update", "load"].forEach((func) => {
      manyRelationships[func] = function(...args) {
        return resource[func](...args);
      };
    });
    return manyRelationships;
  }
}
