import RelationshipDescription from "./RelationshipDescription.js";

export default class SingleRelationshipDescription extends RelationshipDescription {
  constructor( services, name, ResourceClass, initialValues) {

    super( services, name, ResourceClass, initialValues);

    this.primaryResourceTransformerFactory      = services.primaryResourceTransformerFactory;
    this.embeddedRelationshipTransformerFactory = services.embeddedRelationshipTransformerFactory;
    this.resolvedEndpointFactory                = services.resolvedEndpointFactory;
    this.loadedDataEndpointFactory              = services.loadedDataEndpointFactory;
    this.templatedUrlFromUrlFactory             = services.templatedUrlFromUrlFactory;
  }

  embeddedEndpoint(parent, uriParams) {
    var parentEndpoint = parent.self();
    var embeddedRelationshipTransformer = this.embeddedRelationshipTransformerFactory(this.name);
    return this.loadedDataEndpointFactory(parentEndpoint, parent, embeddedRelationshipTransformer);
  }

  linkedEndpoint(parent, uriParams) {
    var url = parent.pathGet(this.linksPath);
    var templatedUrl = this.templatedUrlFromUrlFactory(url, url);
    templatedUrl.addDataPathLink(parent, this.linksPath);
    var primaryResourceTransformer = this.primaryResourceTransformerFactory(
      this.mapperFactory,
      this.serializerFactory,
      this.ResourceClass
    );
    return this.resolvedEndpointFactory(templatedUrl, primaryResourceTransformer);
  }

}
