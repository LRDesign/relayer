import Mapper from "./Mapper.js";
import SingleResourceMapper from "./ResourceMapper.js";
import SingleResourceSerializer from "../serializers/ResourceSerializer.js";
import makeFac from "../dumbMetaFactory.js";

export default class ManyResourceMapper extends Mapper {

  constructor(
    transport,
    response,
    ResourceClass,

    singleResourceMapperFactory = makeFac(SingleResourceMapper),
    singleResourceSerializerFactory = makeFac(SingeResourceSerializer)
  ) {
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
