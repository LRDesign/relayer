import RelationshipDescription from "./RelationshipDescription.js";
import {SimpleFactory} from "../SimpleFactoryInjector.js";

@SimpleFactory('SingleRelationshipDescriptionFactory',
  ['SingleRelationshipInitializerFactory',
  'ResourceMapperFactory',
  'ResourceSerializerFactory',
  'Inflector',
  'PrimaryResourceTransformerFactory',
  'EmbeddedRelationshipTransformerFactory',
  'ResolvedEndpointFactory',
  'LoadedDataEndpointFactory',
  'TemplatedUrlFromUrlFactory'])
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
    var primaryResourceTransformer = this.primaryResourceTransformerFactory(this);
    return this.resolvedEndpointFactory(transport, templatedUrl, primaryResourceTransformer);
  }

}
