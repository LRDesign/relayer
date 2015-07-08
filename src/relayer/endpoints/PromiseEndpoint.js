import Endpoint from "./Endpoint.js"
import {SimpleFactory} from "../SimpleFactoryInjector.js";

@SimpleFactory('PromiseEndpointFactory')
export default class PromiseEndpoint extends Endpoint {

  constructor(promise) {
    super();
    this.endpointPromise = promise;
  }

}
