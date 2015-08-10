import Mapper from "./Mapper.js";

export default class ManyResourceMapper extends Mapper {
  constructor( services, transport, response, ResourceClass) {
    super(transport, response, ResourceClass);
    this.singleResourceMapperFactory = services.resourceMapperFactory;
    this.singleResourceSerializerFactory = services.resourceSerializerFactory;
  }

  initializeModel() {
    this.mapped = [];
  }

  mapNestedRelationships() {
    this.response.forEach((response) => {
      var resourceMapper = this.singleResourceMapperFactory(this.transport, response, this.ResourceClass,
        this.singleResourceMapperFactory,
        this.singleResourceSerializerFactory);
      resourceMapper.uriTemplate = this.uriTemplate;
      this.mapped.push(resourceMapper.map());
    });
  }

}
