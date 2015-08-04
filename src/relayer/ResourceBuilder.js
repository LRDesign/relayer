import {TemplatedUrlFromUrl} from "./TemplatedUrl.js";
import ResEndpoint from "./endpoints/ResolvedEndpoint.js";
import PrimResTrans from "./transformers/PrimaryResourceTransformer.js";
import ThrowErrTrans from "./transformers/ThrowErrorTransformer.js";
import makeFac from "../dumbMetaFactory.js";

export default class ResourceBuilder {
  constructor(
    transport,
    response,
    mapperFactory,
    serializerFactory,
    ResourceClass,

    templatedUrlFromUrlFactory = makeFac(TemplatedUrlFromUrl),
    resolvedEndpointFactory = makeFac(ResEndpoint),
    primaryResourceTransformerFactory = makeFac(PrimRestTrans),
    throwErrorTransformerFactory = makeFac(ThrowErrTrans)
  ) {
    this.transport = transport;
    this.ResourceClass = ResourceClass;
    this.templatedUrlFromUrlFactory = templatedUrlFromUrlFactory;
    this.resolvedEndpointFactory = resolvedEndpointFactory;
    this.primaryResourceTransformerFactory = primaryResourceTransformerFactory;
    this.throwErrorTransformerFactory = throwErrorTransformerFactory;
    this.response = response;
    this.mapperFactory = mapperFactory;
    this.serializerFactory = serializerFactory;
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
      var endpoint = this.resolvedEndpointFactory(this.transport, resource.templatedUrl, resourceTransformer, createResourceTransformer);
      resource.self = function() { return endpoint; }
    }
    return resource;
  }
}
