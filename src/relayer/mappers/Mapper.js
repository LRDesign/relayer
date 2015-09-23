export default class Mapper {
  constructor(services, transport, response, ResourceClass) {
    this.transport = transport;
    this.response = response;
    this.ResourceClass = ResourceClass;

    this.mapperFactory = services.resourceMapperFactory;
    this.serializerFactory = services.resourceSerializerFactory;
  }

  map() {
    this.initializeModel();
    this.mapNestedRelationships();
    return this.mapped;
  }
}
