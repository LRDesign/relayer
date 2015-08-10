import Mapper from "./Mapper.js";

export default class MapResourceMapper extends Mapper {
  constructor( services, transport, response, ResourceClass) {
    super(services, transport, response, ResourceClass);
    this.singleResourceMapperFactory = services.resourceMapperFactory;
    this.singleResourceSerializerFactory = services.resourceSerializerFactory;
  }

  initializeModel() {
    this.mapped = {};
  }

  mapNestedRelationships() {
    Object.keys(this.response).forEach((responseKey) => {
      var response = this.response[responseKey];
      var singleResourceMapper =
        this.singleResourceMapperFactory(this.transport, response,
                                         this.ResourceClass,
                                         this.singleResourceMapperFactory,
                                         this.singleResourceSerializerFactory);
      this.mapped[responseKey] = singleResourceMapper.map();
    });
  }

}
