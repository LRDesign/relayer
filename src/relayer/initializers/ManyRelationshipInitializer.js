import RelationshipInitializer from "./RelationshipInitializer.js";

export default class ManyRelationshipInitializer extends RelationshipInitializer {
  constructor( services, ResourceClass, initialValues) {
    super(services, ResourceClass, initialValues);

    this.singleRelationshipInitializerFactory = services.singleRelationshipInitializerFactory;
  }

  initialize() {
    var relationship = [];
    var response = [];
    if (this.initialValues) {
      this.initialValues.forEach((initialValue) => {
        var singleInitializer = this.singleRelationshipInitializerFactory(this.ResourceClass, initialValue);
        var singleRelationship = singleInitializer.initialize();
        relationship.push(singleRelationship);
        response.push(singleRelationship.response);
      });
    }
    return relationship;
  }
}
