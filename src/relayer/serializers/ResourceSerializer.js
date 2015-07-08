import Serializer from "./Serializer.js";
import {SimpleFactory} from "../SimpleFactoryInjector.js";
import {TemplatedUrl} from "../TemplatedUrl.js";

@SimpleFactory('ResourceSerializerFactory', [])
export default class ResourceSerializer extends Serializer {

  serialize() {
    var relationship;

    Object.keys(this.resource.relationships).forEach((relationshipName) => {
      var relationship = this.resource.relationships[relationshipName];
      if (!(relationship instanceof TemplatedUrl)) {
        var relationshipDefinition = this.resource.constructor.relationships[relationshipName];
        var serializer = relationshipDefinition.serializerFactory(relationship);
        this.resource.pathSet(relationshipDefinition.dataPath, serializer.serialize());
      }
    });

    return this.resource.response;
  }
}
