import Mapper from "./Mapper.js";

export default class ManyResourceMapper extends Mapper {
  constructor( services, response, ResourceClass) {
    super(services, response, ResourceClass);
    this.resourceMapperFactory = services.resourceMapperFactory; //XXX redundant
  }

  initializeModel() {
    this.mapped = [];
  }

  mapNestedRelationships() {
    this.response.forEach((response) => {
      var resourceMapper = this.resourceMapperFactory(response, this.ResourceClass);
      resourceMapper.uriTemplate = this.uriTemplate;
      this.mapped.push(resourceMapper.map());
    });
  }

}
