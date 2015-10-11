import Serializer from "./Serializer.js";
import {TemplatedUrl} from "../TemplatedUrl.js";

export default class ResourceSerializer extends Serializer {
  serialize() {
    var relationship;

    var {resource, services} = this;

    Object.keys(this.resource.relationships).forEach((relationshipName) => {
      var relationship = resource.relationships[relationshipName];
      if (!(relationship instanceof TemplatedUrl)) {
        var relationshipDefinition = resource.constructor.relationships[relationshipName];
        var serializer = relationshipDefinition.serializerFactory(services)(relationship);
        resource.pathSet(relationshipDefinition.dataPath, serializer.serialize());
      }
    });

    return this.resource.response;
  }
}
