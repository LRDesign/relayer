// XXX should just be a function?
export default class TopLevelResourceBuilder {
  constructor( services, api, topLevelResource) {
    this.transport = api.transport;
    this.urlHelper = api.urlHelper;
    this.wellKnownUrl = this.urlHelper.fullUrlRegEx.exec(this.urlHelper.baseUrl)[3];
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
