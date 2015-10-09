import Mapper from "./Mapper.js";
import {SimpleFactory} from "../SimpleFactoryInjector.js";

@SimpleFactory("ResourceMapperFactory", ["TemplatedUrlFromUrlFactory",
  "ResourceBuilderFactory",
  "PrimaryResourceBuilderFactory",
  "PrimaryResourceTransformerFactory"])
export default class ResourceMapper extends Mapper {

  constructor(templatedUrlFromUrlFactory,
    resourceBuilderFactory,
    primaryResourceBuilderFactory,
    primaryResourceTransformerFactory,
    transport,
    response,
    relationshipDescription,
    endpoint = null, useErrors = false) {

    super(transport,
      response,
      relationshipDescription,
      useErrors);

    this.primaryResourceTransformerFactory = primaryResourceTransformerFactory;
    this.templatedUrlFromUrlFactory = templatedUrlFromUrlFactory;
    this.resourceBuilderFactory = resourceBuilderFactory;
    this.primaryResourceBuilderFactory = primaryResourceBuilderFactory;
    this.endpoint = endpoint;
  }

  initializeModel() {
    if (this.endpoint) {
      this.mapped = this.primaryResourceBuilderFactory(this.response, this.ResourceClass).build(this.endpoint);
    } else {
      this.mapped = this.resourceBuilderFactory(this.transport, this.response, this.primaryResourceTransformer, this.ResourceClass, this.relationshipDescription).build(this.uriTemplate);
    }
  }

  get primaryResourceTransformer() {
    this._primaryResourceTransformer = this._primaryResourceTransformer || this.primaryResourceTransformerFactory(this.relationshipDescription)
    return this._primaryResourceTransformer;
  }

  mapNestedRelationships() {
    var relationship;

    this.mapped.relationships = {};
    for (var relationshipName in this.ResourceClass.relationships) {
      if (typeof this.ResourceClass.relationships[relationshipName] == 'object') {
        relationship = this.ResourceClass.relationships[relationshipName];

        if (this.mapped.pathGet(relationship.dataPath)) {
          var subMapper = relationship.mapperFactory(this.transport, this.mapped.pathGet(relationship.dataPath), relationship, this.useErrors);
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
