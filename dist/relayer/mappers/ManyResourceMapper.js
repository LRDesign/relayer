import {SimpleFactory} from "../SimpleFactoryInjector.js";
import Mapper from "./Mapper.js";

@SimpleFactory("ManyResourceMapperFactory", ["SingleRelationshipDescriptionFactory"])
export default class ManyResourceMapper extends Mapper {

  constructor(singleRelationshipDescriptionFactory, transport, response, relationshipDescription, useErrors = false) {
    super(transport, response, relationshipDescription, useErrors);
    this.singleRelationshipDescription = singleRelationshipDescriptionFactory("", this.ResourceClass);
  };

  initializeModel() {
    this.mapped = [];
  }

  mapNestedRelationships() {
    this.response.forEach((response) => {
      var resourceMapper = this.singleRelationshipDescription.mapperFactory(this.transport,
        response, this.singleRelationshipDescription);
      resourceMapper.uriTemplate = this.uriTemplate;
      this.mapped.push(resourceMapper.map());
    });
  }

}
