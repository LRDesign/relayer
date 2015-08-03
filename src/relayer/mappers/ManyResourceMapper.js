import Mapper from "./Mapper.js";
import {factory as singleResourceMapperFactory} from "./ResourceMapper.js";
import {factory as singleResourceSerializerFactory} from "../serializers/ResourceSerializer.js";

export function factory(transport, response, ResourceClass) {
  return new ManyResourceMapper(singleResourceMapperFactory, singleResourceSerializerFactory, transport, response, ResourceClass);
}

export default class ManyResourceMapper extends Mapper {

  constructor(singleResourceMapperFactory, singleResourceSerializerFactory, transport, response, ResourceClass) {
    super(transport, response, ResourceClass);
    this.singleResourceMapperFactory = singleResourceMapperFactory;
    this.singleResourceSerializerFactory = singleResourceSerializerFactory;
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
