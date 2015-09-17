import RelationshipInitializer from "./RelationshipInitializer.js";

export default class ListRelationshipInitializer extends RelationshipInitializer {
  constructor( services, ResourceClass, initialValues) {

    super(services, ResourceClass, initialValues);

    this.manyRelationshipInitializer = services.manyRelationshipInitializerFactory(ResourceClass, initialValues);
    this.ListResourceFac = services.ListResourceFactory;
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
