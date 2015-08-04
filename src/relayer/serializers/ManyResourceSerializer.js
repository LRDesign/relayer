import Serializer from "./Serializer.js";
import ResourceSerializer from "./ResourceSerializer.js";
import makeFac from "../dumbMetaFactory.js";

export default class ManyResourceSerializer extends Serializer {
  constructor(
    resource,
    resourceSerializerFactory = makeFac(ResourceSerializer)
  ) {
    super(resource);
    this.resourceSerializerFactory = resourceSerializerFactory;
  }

  serialize() {
    return this.resource.map((resource) => this.resourceSerializerFactory(resource).serialize());
  }
}
