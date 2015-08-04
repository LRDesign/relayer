import RelationshipInitializer from "./RelationshipInitializer.js";
import SingleRelInit from "./SingleRelationshipInitializer.js";
import makeFac from "../dumbMetaFactory.js";

export default class ManyRelationshipInitializer extends RelationshipInitializer {
  constructor(
    ResourceClass,
    initialValues,
    singleRelationshipInitializerFactory = makeFac(SingleRelInit)
  ) {
    super(ResourceClass, initialValues);
    this.singleRelationshipInitializerFactory = singleRelationshipInitializerFactory;
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
