import Mapper from "./Mapper.js";

export default class ResourceMapper extends Mapper {
  constructor(
    services,
    response,
    ResourceClass,
    endpoint = null
  ) {

    super(services, response, ResourceClass);

    this.templatedUrlFromUrlFactory = services.templatedUrlFromUrlFactory;
    this.resourceBuilderFactory = services.resourceBuilderFactory;
    this.primaryResourceBuilderFactory = services.primaryResourceBuilderFactory;
    this.endpoint = endpoint;
  }

  initializeModel() {
    if (this.endpoint) {
      this.mapped = this.primaryResourceBuilderFactory(this.response, this.ResourceClass).build(this.endpoint);
    } else {
      this.mapped = this.resourceBuilderFactory(this.response, this.mapperFactory, this.serializerFactory, this.ResourceClass).build(this.uriTemplate);
    }
  }

  mapNestedRelationships() {
    var relationship;

    this.mapped.relationships = {};
    for (var relationshipName in this.ResourceClass.relationships) {
      if (typeof this.ResourceClass.relationships[relationshipName] == 'object') {
        relationship = this.ResourceClass.relationships[relationshipName];

        if (this.mapped.pathGet(relationship.dataPath)) {
          var subMapper = relationship.mapperFactory(this.mapped.pathGet(relationship.dataPath), relationship.ResourceClass,
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
