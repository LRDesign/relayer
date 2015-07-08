import Serializer from "./Serializer.js";
import {SimpleFactory} from "../SimpleFactoryInjector.js";

@SimpleFactory('ManyResourceSerializerFactory', ['ResourceSerializerFactory'])
export default class ManyResourceSerializer extends Serializer {
  constructor(resourceSerializerFactory, resource) {
    super(resource);
    this.resourceSerializerFactory = resourceSerializerFactory;
  }

  serialize() {
    return this.resource.map((resource) => this.resourceSerializerFactory(resource).serialize())
  }
}
