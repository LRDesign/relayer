import {SimpleFactory} from "../SimpleFactoryInjector.js";
import Serializer from "./Serializer.js";

@SimpleFactory('ListResourceSerializerFactory', ['ManyResourceSerializerFactory'])
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
