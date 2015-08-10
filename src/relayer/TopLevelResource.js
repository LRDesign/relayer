export default class TopLevelResourceBuilder {
  constructor( services, transport, urlHelper, topLevelResource) {
    this.transport = transport;
    this.urlHelper = urlHelper;
    this.wellKnownUrl = urlHelper.fullUrlRegEx.exec(baseUrl)[3];
    this.templatedUrl = templatedUrlFromUrlFactory(wellKnownUrl, wellKnownUrl);
    this.transformer = primaryResourceTransformerFactory(
      services.resourceMapperFactory,
      services.resourceSerializerFactory,
      topLevelResource
    );
    this.endpoint = resolvedEndpointFactory(transport, templatedUrl, transformer);
    topLevelResource.resourceDescription.applyToEndpoint(endpoint);
  }

  get endpoint() {
    return this.endpoint;
  }
}
