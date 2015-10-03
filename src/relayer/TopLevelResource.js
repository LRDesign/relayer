// XXX should just be a function?
export default class TopLevelResourceBuilder {
  constructor( services, topLevelResource) {
    this.services = services;
    this.transport = services.transport;
    this.urlHelper = services.urlHelper;
    this.wellKnownUrl = this.urlHelper.wellKnownUrl;
    this.templatedUrl = services.templatedUrlFromUrlFactory(this.wellKnownUrl, this.wellKnownUrl);
    this.transformer = services.primaryResourceTransformerFactory(
      services.resourceMapperFactory,
      services.resourceSerializerFactory,
      topLevelResource
    );
    this._endpoint = services.resolvedEndpointFactory(this.templatedUrl, this.transformer);
    topLevelResource.resourceDescription.applyToEndpoint(this._endpoint);
  }

  get endpoint() {
    return this._endpoint;
  }
}
