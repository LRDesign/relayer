import Mapper from "./Mapper.js";

export default class ResourceMapper extends Mapper {
  constructor( services, response, ResourceClass, endpoint = null) {
    super(services, response, ResourceClass);

    this.services                      = services;
    this.templatedUrlFromUrlFactory    = services.templatedUrlFromUrlFactory;
    this.primaryResourceBuilderFactory = services.primaryResourceBuilderFactory;
    this.resourceBuilderFactory        = services.resourceBuilderFactory;
    this.mapperFactory         = services.resourceMapperFactory;
    this.serializerFactory     = services.resourceSerializerFactory;
    this.endpoint                      = endpoint;
  }

  initializePrimaryResource() {
    this.mapped = this.primaryResourceBuilderFactory(this.response, this.ResourceClass).build(this.endpoint);
  }

  initializeEmbeddedResource() {
    this.mapped = this.resourceBuilderFactory(
      this.response, this.ResourceClass, this.mapperFactory, this.serializerFactory
    ).build(this.uriTemplate);
  }

  initializeModel() {
    if (this.endpoint) {
      this.initializePrimaryResource();
    } else {
      this.initializeEmbeddedResource();
    }
  }

  mapNestedRelationships() {
    var relationship;

    this.mapped.relationships = {};
    for (var relationshipName in this.ResourceClass.relationships) {
      if (typeof this.ResourceClass.relationships[relationshipName] == 'object') {
        relationship = this.ResourceClass.relationships[relationshipName];

        if (this.mapped.pathGet(relationship.dataPath)) {
          var subMapper = relationship.mapperFactory(this.services)(
            this.mapped.pathGet(relationship.dataPath),
            relationship.ResourceClass
          );
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
