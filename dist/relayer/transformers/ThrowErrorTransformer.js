import ResourceTransformer from "./ResourceTransformer.js"
import {SimpleFactory} from "../SimpleFactoryInjector.js"

@SimpleFactory('ThrowErrorTransformerFactory')
export default class ThrowErrorTransformer extends ResourceTransformer {
  transformRequest(endpoint, resource) {
    throw "This Resource Cannot Be Updated Or Created";
  }

  transformResponse(endpoint, response) {
    throw "There is no Resource To Create From This Response";
  }
}
