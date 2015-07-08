import RelationshipInitializer from "./RelationshipInitializer.js";
import {SimpleFactory} from "../SimpleFactoryInjector.js";

@SimpleFactory('SingleRelationshipInitializerFactory', [])
export default class SingleRelationshipInitializer extends RelationshipInitializer {
  initialize() {
    var relationship = new this.ResourceClass();
    Object.keys(this.initialValues).forEach((property) => {
      relationship[property] = this.initialValues[property];
    });
    return relationship;
  }
}
