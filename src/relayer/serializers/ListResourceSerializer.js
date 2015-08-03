import Serializer from "./Serializer.js";
import {factory as manyResourceSerializerFactory} from "./ManyResourceSerializer.js";

export function factory(resource) {
  return new ListResourceSerializer(manyResourceSerializerFactory, resource);
}

export default class ListResourceSerializer extends Serializer {
  constructor(manyResourceSerializerFactory,
    resource) {
    super(resource);
    this.manyResourceSerializerFactory = manyResourceSerializerFactory;
  }

  serialize() {
    var data = this.manyResourceSerializerFactory(this.resource).serialize();
    this.resource.resource.pathSet("$.data", data);
    return this.resource.resource.response;
  }
}
