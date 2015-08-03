import Endpoint from "./Endpoint.js"

export default class PromiseEndpoint extends Endpoint {
  constructor(promise) {
    super();
    this.endpointPromise = promise;
  }
}
