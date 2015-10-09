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
  'TemplatedUrlFactory'])
export default class SingleRelationshipDescription extends RelationshipDescription {
  constructor(relationshipInitializerFactory,
    resourceMapperFactory,
    resourceSerializerFactory,
    inflector,
    primaryResourceTransformerFactory,
    embeddedRelationshipTransformerFactory,
    resolvedEndpointFactory,
    loadedDataEndpointFactory,
    templatedUrlFactory,
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
    this.templatedUrlFactory = templatedUrlFactory;
    this._templated = false;
  }

  set templated(templated) {
    this._templated = templated;
  }

  get templated() {
    return this._templated;
  }

  embeddedEndpoint(parent, uriParams) {
    if (this._templated) {
      throw "A templated hasOne relationship cannot be embedded";
    }
    var parentEndpoint = parent.self();
    var embeddedRelationshipTransformer = this.embeddedRelationshipTransformerFactory(this.name);
    return this.loadedDataEndpointFactory(parentEndpoint, parent, embeddedRelationshipTransformer);
  }

  linkedEndpoint(parent, uriParams) {
    var transport = parent.self().transport;
    var url = parent.pathGet(this.linksPath);
    var params = this._templated ? uriParams : {};
    var templatedUrl = this.templatedUrlFactory(url, params);
    if (!this._templated) {
      templatedUrl.addDataPathLink(parent, this.linksPath);
    }
    var primaryResourceTransformer = this.primaryResourceTransformerFactory(this);
    return this.resolvedEndpointFactory(transport, templatedUrl, primaryResourceTransformer);
  }

}
