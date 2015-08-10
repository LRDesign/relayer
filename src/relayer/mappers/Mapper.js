export default class Mapper {
  constructor(services, transport, response, ResourceClass, mapperFactory, serializerFactory) {
    this.transport = transport;
    this.response = response;
    this.ResourceClass = ResourceClass;
    this.mapperFactory = mapperFactory;
    this.serializerFactory = serializerFactory;
  }

  map() {
    this.initializeModel();
    this.mapNestedRelationships();
    return this.mapped;
  }
}
