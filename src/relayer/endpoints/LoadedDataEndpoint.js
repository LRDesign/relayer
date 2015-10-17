import ResolvedEndpoint from "./ResolvedEndpoint.js";
import {SimpleFactory} from "../SimpleFactoryInjector.js";

@SimpleFactory('LoadedDataEndpointFactory', ['XingPromise'])
export default class LoadedDataEndpoint extends ResolvedEndpoint {

  constructor(Promise, resolvedEndpoint, resource, resourceTransformers = [], createResourceTransformers = []) {
    super(Promise, resolvedEndpoint.transport,
      resolvedEndpoint.templatedUrl,
      resolvedEndpoint.resourceTransformers.concat(resourceTransformers),
      resolvedEndpoint.createResourceTransformers.concat(createResourceTransformers));
    this.resource = resource;
    this.Promise = Promise;
    this.data = resolvedEndpoint._transformRequest(resolvedEndpoint.resourceTransformers, resource);
  }

  _load() {
    return this._transformResponse(this.resourceTransformers, this.Promise.resolve({
      data: this.data, etag: this.templatedUrl.etag}));
  }

  _update(resource) {
    var request = this._transformRequest(this.resourceTransformers, resource);
    var response = this.transport.put(this.templatedUrl.url, request);
    response = response.then((data) => { this.data = data.data; return data; });
    return this._transformResponse(this.resourceTransformers, response);
  }

}
