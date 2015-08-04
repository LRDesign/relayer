import Serializer from "./Serializer.js";
import ManyResourceSerializer from "./ManyResourceSerializer.js";
import makeFac from "../dumbMetaFactory.js";

export default class ListResourceSerializer extends Serializer {
  constructor( resource,
    manyResourceSerializerFactory = makeFac(ManyResourceSerializer);
  ) {
    super(resource);
    this.manyResourceSerializerFactory = manyResourceSerializerFactory;
  }

  serialize() {
    var data = this.manyResourceSerializerFactory(this.resource).serialize();
    this.resource.resource.pathSet("$.data", data);
    return this.resource.resource.response;
  }
}
