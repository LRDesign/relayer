export default class Mapper {
  constructor(services, response, ResourceClass) {
    this.services = services;
    this.response = response;
    this.ResourceClass = ResourceClass;

    this.transport = services.transport;
    this.mapperFactory = services.resourceMapperFactory;
    this.serializerFactory = services.resourceSerializerFactory;
  }

  map() {
    this.initializeModel();
    this.mapNestedRelationships();
    return this.mapped;
  }
}
