import Serializer from "./Serializer.js";
import ResourceSerializer from "./ResourceSerializer.js";
import makeFac from "../dumbMetaFactory.js";

export default class MapResourceSerializer extends Serializer {
  constructor( resource,
    resourceSerializerFactory = makeFac(ResourceSerializer)
  ) {
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
