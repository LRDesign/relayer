import Serializer from "./Serializer.js";

export default class MapResourceSerializer extends Serializer {
  constructor( services, resource) {
    super(services, resource);
    this.resourceSerializerFactory = services.resourceSerializerFactory;
  }

  serialize() {
    return Object.keys(this.resource).reduce((data, key) => {
      data[key] = this.resourceSerializerFactory(this.resource[key]).serialize();
      return data;
    }, {});
  }
}
