import Endpoint from "./Endpoint.js"

export default class PromiseEndpoint extends Endpoint {
  constructor(promiseFunction) {
    super();
    this.endpointPromise = promiseFunction;
  }

}
