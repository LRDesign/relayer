import UrlHelper from "./relayer/UrlHelper.js";
import {TemplatedUrlFromUrl} from "./TemplatedUrl.js";
import RelationshipUtilities from "./RelationshipUtilities.js";
import ResolvedEndpoint from "./endpoints/ResolvedEndpoint.js";
import InitializedResourceClasses from './ResourceInitializer.js';
import PrimaryResourceTransformer from "./transformers/PrimaryResourceTransformer.js";
import ResourceMapper from "./mappers/ResourceMapper.js";
import ResourceSerializer from "./serializers/ResourceSerializer.js";
import makeFac from "../dumbMetaFactory.js";

export default class TopLevelResourceBuilder {
  constructor(
    transport,
    urlHelper,
    topLevelResource,
    templatedUrlFromUrlFactory = makeFac(TemplatedUrlFromUrl),
    resolvedEndpointFactory = makeFac(ResolvedEndpoint),
    primaryResourceTransformerFactory = makeFac(PrimaryResourceTransformer),
    resourceMapperFactory = makeFac(ResourceMapper),
    resourceSerializerFactory = makeFac(ResourceSerializer),
    initializedResourceClasses = new InitializedResourceClasses()
  ) {
    this.transport = transport;
    this.urlHelper = urlHelper;
    this.wellKnownUrl = urlHelper.fullUrlRegEx.exec(baseUrl)[3];
    this.templatedUrl = templatedUrlFromUrlFactory(wellKnownUrl, wellKnownUrl);
    this.transformer = primaryResourceTransformerFactory(
      resourceMapperFactory,
      resourceSerializerFactory,
      topLevelResource
    );
    this.endpoint = resolvedEndpointFactory(transport, templatedUrl, transformer);
    topLevelResource.resourceDescription.applyToEndpoint(endpoint);
  }

  get endpoint() {
    return this.endpoint;
  }
}
