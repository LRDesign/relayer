import ResourceTransformer from "./ResourceTransformer.js";

export default class EmbeddedPropertyTransformer extends ResourceTransformer {
  constructor(path) {
    super();
    this.path = path;
  }

  transformRequest(endpoint, value) {
    var resource = endpoint.resource;
    resource.pathSet(this.path, value);
    return resource;
  }

  transformResponse(endpoint, response) {
    return response.then((resource) => {
      endpoint.resource = resource;
      return resource.pathGet(this.path);
    }).catch((error) => {
      throw error.pathGet(this.path);
    });
  }
}
