import Serializer from "./Serializer.js";
import {SimpleFactory} from "../SimpleFactoryInjector.js";

@SimpleFactory('MapResourceSerializerFactory', ['ResourceSerializerFactory'])
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
