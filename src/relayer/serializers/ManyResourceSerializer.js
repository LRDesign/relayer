import Serializer from "./Serializer.js";
import ResourceSerializer from "./ResourceSerializer.js";

export function factory(resourceSerializerFactory, resource) {
  function makeResourceSerializer(resource){
    return new ResourceSerializer(resource);
  }

  return new ManyResourceSerializer(makeResourceSerializer, resource);
}

export default class ManyResourceSerializer extends Serializer {
  constructor(resourceSerializerFactory, resource) {
    super(resource);
    this.resourceSerializerFactory = resourceSerializerFactory;
  }

  serialize() {
    return this.resource.map((resource) => this.resourceSerializerFactory(resource).serialize());
  }
}
