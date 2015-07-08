import {SimpleFactory} from "../SimpleFactoryInjector.js";
import Mapper from "./Mapper.js";

@SimpleFactory("MapResourceMapperFactory", ["ResourceMapperFactory", "ResourceSerializerFactory"])
export default class MapResourceMapper extends Mapper {

  constructor(singleResourceMapperFactory, singleResourceSerializerFactory,
    transport, response, ResourceClass) {
    super(transport, response, ResourceClass);
    this.singleResourceMapperFactory = singleResourceMapperFactory;
    this.singleResourceSerializerFactory = singleResourceSerializerFactory;
  };

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
