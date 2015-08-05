import {SimpleFactory} from "./SimpleFactoryInjector.js";

@SimpleFactory("ResourceBuilderFactory", ["TemplatedUrlFromUrlFactory",
  "ResolvedEndpointFactory",
  "ThrowErrorTransformerFactory"])
export default class ResourceBuilder {
  constructor(templatedUrlFromUrlFactory,
    resolvedEndpointFactory,
    throwErrorTransformerFactory,
    transport,
    response,
    primaryResourceTransformer,
    ResourceClass) {

    this.transport = transport;
    this.ResourceClass = ResourceClass;
    this.templatedUrlFromUrlFactory = templatedUrlFromUrlFactory;
    this.resolvedEndpointFactory = resolvedEndpointFactory;
    this.throwErrorTransformerFactory = throwErrorTransformerFactory;
    this.response = response;
    this.primaryResourceTransformer = primaryResourceTransformer;
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
      var createResourceTransformer = this.throwErrorTransformerFactory();
      var endpoint = this.resolvedEndpointFactory(this.transport, resource.templatedUrl, this.primaryResourceTransformer, createResourceTransformer);
      resource.self = function() { return endpoint; }
    }
    return resource;
  }
}
