import Endpoint from "./Endpoint.js";

export default class ResolvedEndpoint extends Endpoint {
  constructor(
    services,
    templatedUrl,
    resourceTransformers = [],
    createResourceTransformers = []
  ) {
    super(services);


    this.transport = services.transport;
    this.templatedUrl = templatedUrl;
    if (Array.isArray(resourceTransformers)) {
      this.resourceTransformers = resourceTransformers;
    } else {
      this.resourceTransformers = [resourceTransformers];
    }
    if (Array.isArray(createResourceTransformers)) {
      this.createResourceTransformers = createResourceTransformers;
    } else {
      this.createResourceTransformers = [createResourceTransformers];
    }
    this.endpointPromise = () => { return services.Promise.resolve(this); };
  }

  _load() {
    var response = this.transport.get(this.templatedUrl.url, this.templatedUrl.etag);
    return this._transformResponse(this.resourceTransformers, response);
  }

  _update(resource) {
    var request = this._transformRequest(this.resourceTransformers, resource);
    var response = this.transport.put(this.templatedUrl.url, request, this.templatedUrl.etag);
    return this._transformResponse(this.resourceTransformers, response);
  }

  _create(resource) {
    var request = this._transformRequest(this.createResourceTransformers, resource);
    var response = this.transport.post(this.templatedUrl.url, request);
    return this._transformResponse(this.createResourceTransformers, response);
  }

  _transformResponse(transformers, response) {
    var self = this; // XXX es6, tho?
    return transformers.reduce((interimResponse, transformer) => {
      return transformer.transformResponse(self, interimResponse);
    }, response);
  }

  _transformRequest(transformers, request) {
    var self = this;
    return transformers.slice(0).reverse().reduce((interimRequest, transformer) => {
      return transformer.transformRequest(self, interimRequest);
    }, request);
  }

  _remove() {
    return this.transport.remove(this.templatedUrl.url);
  }
}
