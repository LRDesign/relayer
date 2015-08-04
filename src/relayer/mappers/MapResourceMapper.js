import Mapper from "./Mapper.js";
import ResourceMapper from "./ResourceMapper.js";
import ResourceSerializer from "../serializer/ResourceSerializer.js";
import makeFac from "../dumbMetaFactory.js";

export default class MapResourceMapper extends Mapper {
  constructor(
    transport,
    response,
    ResourceClass,
    singleResourceMapperFactory = makeFac(ResourceMapper),
    singleResourceSerializerFactory = makeFac(ResourceSerializer)
  ) {
    super(transport, response, ResourceClass);
    this.singleResourceMapperFactory = singleResourceMapperFactory;
    this.singleResourceSerializerFactory = singleResourceSerializerFactory;
  }

  initializeModel() {
    this.mapped = {};
  }

  mapNestedRelationships() {
    Object.keys(this.response).forEach((responseKey) => {
      var response = this.response[responseKey];
      var singleResourceMapper = this.singleResourceMapperFactory(this.transport, response, this.ResourceClass, this.singleResourceMapperFactory, this.singleResourceSerializerFactory);
      this.mapped[responseKey] = singleResourceMapper.map();
    });
  }

}
