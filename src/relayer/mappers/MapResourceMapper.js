import ResourceMapper from "./ResourceMapper.js";

export default class MapResourceMapper extends ResourceMapper {
  constructor( services, response, ResourceClass) {
    super(services, response, ResourceClass);
    this.resourceMapperFactory = services.resourceMapperFactory;
  }

  initializeModel() {
    this.mapped = {};
  }

  mapNestedRelationships() {
    Object.keys(this.response).forEach((responseKey) => {
      var response = this.response[responseKey];
      var singleResourceMapper =
        this.resourceMapperFactory(response, this.ResourceClass);
      this.mapped[responseKey] = singleResourceMapper.map();
    });
  }

}
