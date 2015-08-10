import Serializer from "./Serializer.js";

export default class ListResourceSerializer extends Serializer {
  constructor( services, resource) {
    super(services, resource);
    this.manyResourceSerializerFactory = services.manyResourceSerializerFactory;
  }

  serialize() {
    var data = this.manyResourceSerializerFactory(this.resource).serialize();
    this.resource.resource.pathSet("$.data", data);
    return this.resource.resource.response;
  }
}
