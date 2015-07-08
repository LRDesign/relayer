import {SimpleFactory} from "../SimpleFactoryInjector.js";
import Mapper from "./Mapper.js";

@SimpleFactory("ManyResourceMapperFactory", ["ResourceMapperFactory", "ResourceSerializerFactory"])
export default class ManyResourceMapper extends Mapper {

  constructor(singleResourceMapperFactory, singleResourceSerializerFactory, transport, response, ResourceClass) {
    super(transport, response, ResourceClass);
    this.singleResourceMapperFactory = singleResourceMapperFactory;
    this.singleResourceSerializerFactory = singleResourceSerializerFactory;
  };

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
