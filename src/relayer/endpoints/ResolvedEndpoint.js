import Endpoint from "./Endpoint.js";
import {SimpleFactory} from "../SimpleFactoryInjector.js";

@SimpleFactory('ResolvedEndpointFactory', ["XingPromise"])
export default class ResolvedEndpoint extends Endpoint {
  constructor(Promise, transport, templatedUrl, resourceTransformers = [], createResourceTransformers = []) {
    super();
    this.transport = transport;
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
    this.endpointPromise = () => { return Promise.resolve(this) };
  }

  _load() {
    var response = this.transport.get(this.templatedUrl.url, this.templatedUrl.etag);
    return this._transformResponse(this.resourceTransformers, response);
  }

  _update(resource) {
    var request = this._transformRequest(this.resourceTransformers, resource);
    var response = this.transport.put(this.templatedUrl.url, request, this.templatedUrl.etag);
    return this._transformResponse(this.resourceTransformers, response) }

  _create(resource) {
    var request = this._transformRequest(this.createResourceTransformers, resource);
    var response = this.transport.post(this.templatedUrl.url, request);
    return this._transformResponse(this.createResourceTransformers, response);
  }

  _transformResponse(transformers, response) {
    return transformers.reduce((interimResponse, transformer) => {
      return transformer.transformResponse(this, interimResponse);
    }, response);
  }

  _transformRequest(transformers, request) {
    return transformers.slice(0).reverse().reduce((interimRequest, transformer) => {

      return transformer.transformRequest(this, interimRequest);
    }, request);
  }

  _remove() {
    return this.transport.delete(this.templatedUrl.url);
  }
}
