import RelationshipInitializer from "./RelationshipInitializer.js";
import {SimpleFactory} from "../SimpleFactoryInjector.js";

@SimpleFactory('ManyRelationshipInitializerFactory', ['SingleRelationshipInitializerFactory'])
export default class ManyRelationshipInitializer extends RelationshipInitializer {
  constructor(singleRelationshipInitializerFactory,
    ResourceClass,
    initialValues) {
    super(ResourceClass, initialValues);
    this.singleRelationshipInitializerFactory = singleRelationshipInitializerFactory;
  }

  initialize() {
    var relationship = [];
    var response = [];
    this.initialValues.forEach((initialValue) => {
      var singleInitializer = this.singleRelationshipInitializerFactory(this.ResourceClass, initialValue);
      var singleRelationship = singleInitializer.initialize();
      relationship.push(singleRelationship);
      response.push(singleRelationship.response);
    });
    return relationship;
  }
}
