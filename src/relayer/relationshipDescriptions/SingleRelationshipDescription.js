import RelationshipDescription from "./RelationshipDescription.js";

export default class SingleRelationshipDescription extends RelationshipDescription {
  embeddedEndpoint(parent, uriParams) {
    var embeddedRelationshipTransformerFactory = parent.services.embeddedRelationshipTransformerFactory;
    var loadedDataEndpointFactory              = parent.services.loadedDataEndpointFactory;

    var parentEndpoint = parent.self();
    var embeddedRelationshipTransformer = embeddedRelationshipTransformerFactory(this.name);

    return loadedDataEndpointFactory(parentEndpoint, parent, embeddedRelationshipTransformer);
  }

  linkedEndpoint(parent, uriParams) {
    var primaryResourceTransformerFactory = parent.services.primaryResourceTransformerFactory;
    var resolvedEndpointFactory           = parent.services.resolvedEndpointFactory;
    var templatedUrlFromUrlFactory        = parent.services.templatedUrlFromUrlFactory;
    var mapperFactory                     = parent.services.resourceMapperFactory;
    var serializerFactory                 = parent.services.resourceSerializerFactory;

    var url = parent.pathGet(this.linksPath);
    var templatedUrl = templatedUrlFromUrlFactory(url, url);
    templatedUrl.addDataPathLink(parent, this.linksPath);

    var primaryResourceTransformer = primaryResourceTransformerFactory(
      mapperFactory,
      serializerFactory,
      this.ResourceClass
    );

    return resolvedEndpointFactory(templatedUrl, primaryResourceTransformer);
  }

  initializerFactory(services) {
    return services.singleRelationshipInitializerFactory;
  }

  mapperFactory(services) {
    return services.resourceMapperFactory;
  }

  serializerFactory(services) {
    return services.resourceSerializerFactory;
  }
}
