export default class ResourceBuilder {
  constructor( services, response, ResourceClass) {
    this.transport = services.transport;
    this.ResourceClass = ResourceClass;

    this.templatedUrlFromUrlFactory        = services.templatedUrlFromUrlFactory;
    this.resolvedEndpointFactory           = services.resolvedEndpointFactory;
    this.primaryResourceTransformerFactory = services.primaryResourceTransformerFactory;
    this.throwErrorTransformerFactory      = services.throwErrorTransformerFactory;

    this.response = response;

    this.mapperFactory = services.mapperFactory;
    this.serializerFactory = services.serializerFactory;
  }

  build(uriTemplate = null) {
    var resource = new this.ResourceClass(this.response);
    if (resource.pathGet("$.links.self")) {
      if (uriTemplate) {
        resource.templatedUrl = this.templatedUrlFromUrlFactory(uriTemplate, resource.pathGet("$.links.self"));
      } else {
        resource.templatedUrl = this.templatedUrlFromUrlFactory(resource.pathGet("$.links.self"), resource.pathGet("$.links.self"));
      }
      resource.templatedUrl.addDataPathLink(resource, "$.links.self");
      var resourceTransformer = this.primaryResourceTransformerFactory(this.mapperFactory, this.serializerFactory, this.ResourceClass);
      var createResourceTransformer = this.throwErrorTransformerFactory();
      var endpoint = this.resolvedEndpointFactory(resource.templatedUrl, resourceTransformer, createResourceTransformer);
      resource.self = function() { return endpoint; };
    }
    return resource;
  }
}
