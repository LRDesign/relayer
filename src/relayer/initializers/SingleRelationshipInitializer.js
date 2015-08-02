import RelationshipInitializer from "./RelationshipInitializer.js";

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
