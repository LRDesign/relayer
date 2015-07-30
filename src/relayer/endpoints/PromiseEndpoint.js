import Endpoint from "./Endpoint.js"
import {SimpleFactory} from "../SimpleFactoryInjector.js";

@SimpleFactory('PromiseEndpointFactory')
export default class PromiseEndpoint extends Endpoint {

  constructor(promiseFunction) {
    super();
    this.endpointPromise = promiseFunction;
  }

}
