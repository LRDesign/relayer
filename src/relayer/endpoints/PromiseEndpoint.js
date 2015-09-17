import Endpoint from "./Endpoint.js";

export default class PromiseEndpoint extends Endpoint {
  constructor(services, promiseFunction) {
    super(services);
    this.endpointPromise = promiseFunction;
  }

}
