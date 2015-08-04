import Mapper from "./Mapper.js";
import {TemplatedUrlFromUrl} from "../TemplatedUrl.js";
import ResourceBuilder from "../ResourceBuilder.js";
import PrimaryResourceBuilder from "../PrimaryResourceBuilder.js";
import makeFac from "../dumbMetaFactory.js";

export default class ResourceMapper extends Mapper {
  constructor(
    transport,
    response,
    ResourceClass,
    mapperFactory,
    serializerFactory,
    endpoint = null,

    templatedUrlFromUrlFactory = makeFac(TemplatedUrlFromUrl),
    resourceBuilderFactory = makeFac(ResourceBuild),
    primaryResourceBuilderFactory = makeFac(PrimaryResourceBuilder)
  ) {

    super(transport, response, ResourceClass, mapperFactory, serializerFactory);

    this.templatedUrlFromUrlFactory = templatedUrlFromUrlFactory;
    this.resourceBuilderFactory = resourceBuilderFactory;
    this.primaryResourceBuilderFactory = primaryResourceBuilderFactory;
    this.endpoint = endpoint;
  }

  initializeModel() {
    if (this.endpoint) {
      this.mapped = this.primaryResourceBuilderFactory(this.response, this.ResourceClass).build(this.endpoint);
    } else {
      this.mapped = this.resourceBuilderFactory(this.transport, this.response, this.mapperFactory, this.serializerFactory, this.ResourceClass).build(this.uriTemplate);
    }
  }

  mapNestedRelationships() {
    var relationship;

    this.mapped.relationships = {};
    for (var relationshipName in this.ResourceClass.relationships) {
      if (typeof this.ResourceClass.relationships[relationshipName] == 'object') {
        relationship = this.ResourceClass.relationships[relationshipName];

        if (this.mapped.pathGet(relationship.dataPath)) {
          var subMapper = relationship.mapperFactory(this.transport, this.mapped.pathGet(relationship.dataPath), relationship.ResourceClass,
            relationship.mapperFactory, relationship.serializerFactory);
          this.mapped.relationships[relationshipName] = subMapper.map();
        } else if (this.mapped.pathGet(relationship.linksPath)) {
          var templatedUrl = this.templatedUrlFromUrlFactory(this.mapped.pathGet(relationship.linksPath), this.mapped.pathGet(relationship.linksPath));
          templatedUrl.addDataPathLink(this.mapped, relationship.linksPath);
          this.mapped.relationships[relationshipName] = templatedUrl;
        }
      }
    }
  }
}
