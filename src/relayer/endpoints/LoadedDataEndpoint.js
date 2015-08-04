import ResolvedEndpoint from "./ResolvedEndpoint.js";
import Promise from "../Promise.js";

export default class LoadedDataEndpoint extends ResolvedEndpoint {
  constructor(
    resolvedEndpoint,
    resource,
    resourceTransformers = [],
    createResourceTransformers = [],
    thisPromise = Promise
  ) {
    super(Promise, resolvedEndpoint.transport,
      resolvedEndpoint.templatedUrl,
      resolvedEndpoint.resourceTransformers.concat(resourceTransformers),
      resolvedEndpoint.createResourceTransformers.concat(createResourceTransformers));
    this.resource = resource;
    this.Promise = thisPromise;
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
