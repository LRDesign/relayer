import Mapper from "./Mapper.js";
import {templatedUrlFromUrlFactory} from "../TemplatedUrl.js";
import {factory as resourceBuilderFactory} from "../ResourceBuilder.js";
import {factory as primaryResourceBuilderFactory} from "../PrimaryResourceBuilder.js";

export function partialFactory(transport, response, ResourceClass, mapperFactory, serializerFactory, endpoint, subfactory) {
  return subfactory(
    templatedUrlFromUrlFactory, resourceBuilderFactory, primaryResourceBuilderFactory,
    transport, response, ResourceClass, mapperFactory, serializerFactory, endpoint
  );
}

export function factory(transport, response, ResourceClass, mapperFactory, serializerFactory, endpoint = null) {
  return partialFactory(transport, response, ResourceClass, mapperFactory, serializerFactory, endpoint, (...args) => {
    return new ResourceMapper(...args);
  });
}

export default class ResourceMapper extends Mapper {

  constructor(templatedUrlFromUrlFactory,
    resourceBuilderFactory,
    primaryResourceBuilderFactory,
    transport,
    response,
    ResourceClass,
    mapperFactory,
    serializerFactory,
    endpoint = null) {

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
