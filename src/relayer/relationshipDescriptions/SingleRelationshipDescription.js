import RelationshipDescription from "./RelationshipDescription.js";

import RrimaryResourceTransformer from "../transformers/PrimaryResourceTransformer.js";
import EmbeddedRelationshipTransformer from "../transformers/EmbeddedPropertyTransformer.js";
import ResolvedEndpoint from "../endpoints/ResolvedEndpoint.js";
import LoadedDataEndpoint from "../endpoints/LoadedDataEndpoint.js";
import {TemplatedUrlFromUrl} from "../TemplatedUrl.js";

export default class SingleRelationshipDescription extends RelationshipDescription {
  constructor(
    name,
    ResourceClass,
    initialValues,

    primaryResourceTransformerFactory = makeFac(PrimaryResourceTransformer),
    embeddedRelationshipTransformerFactory = makeFac(EmbeddedRelationshipTransformer),
    resolvedEndpointFactory = makeFac(ResolvedEndpoint),
    loadedDataEndpointFactory = makeFac(LoadedDataEndpoint),
    templatedUrlFromUrlFactory = makeFac(TemplatedUrlFromUrl),

    ...superArgs
  ) {

    super( name, ResourceClass, initialValues, ...superArgs);

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
    var primaryResourceTransformer = this.primaryResourceTransformerFactory(
      this.mapperFactory,
      this.serializerFactory,
      this.ResourceClass
    );
    return this.resolvedEndpointFactory(transport, templatedUrl, primaryResourceTransformer);
  }

}
