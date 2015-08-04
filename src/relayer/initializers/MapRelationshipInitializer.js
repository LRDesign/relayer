import RelationshipInitializer from "./RelationshipInitializer.js";
import SingleRelationship from "./SingleRelationship.js";
import makeFac from "../dumbMetaFactory.js";

export default class MapRelationshipInitializer extends RelationshipInitializer {
  constructor(
    ResourceClass,
    initialValues,
    singleRelationshipInitializerFactory = makeFac(SingleRelationshipInitializer)
  ) {
    super(ResourceClass, initialValues);
    this.singleRelationshipInitializerFactory = singleRelationshipInitializerFactory;
  }

  initialize() {
    var relationship = {};
    var response = {};
    if (this.initialValues) {
      Object.keys(this.initialValues).forEach((key) => {
        var singleInitializer = this.singleRelationshipInitializerFactory(this.ResourceClass, this.initialValues[key]);
        var singleRelationship = singleInitializer.initialize();
        relationship[key] = singleRelationship;
        response[key] = singleRelationship.response;
      });
    }
    return relationship;
  }
}
