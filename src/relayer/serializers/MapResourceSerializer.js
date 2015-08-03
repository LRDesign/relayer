import Serializer from "./Serializer.js";
import {factory as resourceSerializerFactory} from "./ResourceSerializer.js";

export function factory(resourceSerializerFactory, resource) {
  return new MapResourceSerializer(resourceSerializerFactory, resource);
}

export default class MapResourceSerializer extends Serializer {
  constructor(resourceSerializerFactory, resource) {
    super(resource);
    this.resourceSerializerFactory = resourceSerializerFactory;
  }

  serialize() {
    return Object.keys(this.resource).reduce((data, key) => {
      data[key] = this.resourceSerializerFactory(this.resource[key]).serialize();
      return data;
    }, {});
  }
}
