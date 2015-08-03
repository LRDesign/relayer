import RelationshipDescription from "./RelationshipDescription.js";
import inflector from "../singletons/Inflector.js";
import {factory as relationshipInitializerFactory} from "../initializers/RelationshipInitializer.js";
import {factory as resourceMapperFactory} from "../mappers/ResourceMapper.js";
import {factory as resourceSerializerFactory} from "../serializers/ResourceSerializer.js";
import {factory as primaryResourceTransformerFactory} from "../transformers/PrimaryResourceTransformer.js";
import {factory as embeddedRelationshipTransformerFactory} from "../transformers/EmbeddedPropertyTransformer.js";
import {factory as resolvedEndpointFactory} from "../endpoints/ResolvedEndpoint.js";
import {factory as loadedDataEndpointFactory} from "../endpoints/LoadedDataEndpoint.js";
import {factory as templatedUrlFromUrlFactory} from "../TemplatedUrl.js";

export function factory(name, ResourceClass, initialValues) {
  return new SingleRelationshipDescription(
    relationshipInitializerFactory,
    resourceMapperFactory,
    resourceSerializerFactory,
    inflector,
    primaryResourceTransformerFactory,
    embeddedRelationshipTransformerFactory,
    resolvedEndpointFactory,
    loadedDataEndpointFactory,
    templatedUrlFromUrlFactory,
    name,
    ResourceClass,
    initialValues);
}

export default class SingleRelationshipDescription extends RelationshipDescription {
  constructor(relationshipInitializerFactory,
    resourceMapperFactory,
    resourceSerializerFactory,
    inflector,
    primaryResourceTransformerFactory,
    embeddedRelationshipTransformerFactory,
    resolvedEndpointFactory,
    loadedDataEndpointFactory,
    templatedUrlFromUrlFactory,
    name,
    ResourceClass,
    initialValues) {

    super(relationshipInitializerFactory,
      resourceMapperFactory,
      resourceSerializerFactory,
      inflector,
      name,
      ResourceClass,
      initialValues);

    this.primaryResourceTransformerFactory = primaryResourceTransformerFactory;
    this.embeddedRelationshipTransformerFactory = embeddedRelationshipTransformerFactory;
    this.resolvedEndpointFactory = resolvedEndpointFactory;
    this.loadedDataEndpointFactory = loadedDataEndpointFactory;
    this.templatedUrlFromUrlFactory = templatedUrlFromUrlFactory;
  }

  embeddedEndpoint(parent, uriParams) {
    var parentEndpoint = parent.self();
    var embeddedRelationshipTransformer = this.embeddedRelationshipTransformerFactory(this.name);
    return this.loadedDataEndpointFactory(parentEndpoint, parent, embeddedRelationshipTransformer);
  }

  linkedEndpoint(parent, uriParams) {
    var transport = parent.self().transport;
    var url = parent.pathGet(this.linksPath);
    var templatedUrl = this.templatedUrlFromUrlFactory(url, url);
    templatedUrl.addDataPathLink(parent, this.linksPath);
    var primaryResourceTransformer = this.primaryResourceTransformerFactory(this.mapperFactory,
      this.serializerFactory,
      this.ResourceClass);
    return this.resolvedEndpointFactory(transport, templatedUrl, primaryResourceTransformer);
  }

}
