import Serializer from "./Serializer.js";

export default class ManyResourceSerializer extends Serializer {
  constructor( services, resource) {
    super(services, resource);
    this.resourceSerializerFactory = services.resourceSerializerFactory;
  }

  serialize() {
    return this.resource.map((resource) => this.resourceSerializerFactory(resource).serialize());
  }
}
