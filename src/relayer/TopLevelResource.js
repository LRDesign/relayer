export default class TopLevelResourceBuilder {
  constructor( services, topLevelResource) {
    this.transport = services.transport;
    this.urlHelper = services.urlHelper;
    this.wellKnownUrl = this.urlHelper.fullUrlRegEx.exec(services.baseUrl)[3];
    this.templatedUrl = services.templatedUrlFromUrlFactory(this.wellKnownUrl, this.wellKnownUrl);
    this.transformer = services.primaryResourceTransformerFactory(
      services.resourceMapperFactory,
      services.resourceSerializerFactory,
      topLevelResource
    );
    this._endpoint = services.resolvedEndpointFactory(this.templatedUrl, this.transformer);
    console.log("relayer/TopLevelResource.js:13", "topLevelResource.resourceDescription", topLevelResource.resourceDescription);
    topLevelResource.resourceDescription.applyToEndpoint(this._endpoint);
  }

  get endpoint() {
    return this._endpoint;
  }
}
