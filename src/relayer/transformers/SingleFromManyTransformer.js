import ResourceTransformer from "./ResourceTransformer.js";

export default class SingleFromManyTransformer extends ResourceTransformer {
  constructor(relationshipName, property) {
    super();
    this.property = property;
    this.relationshipName = relationshipName;
  }

  transformRequest(endpoint, value) {
    var resource = endpoint.resource;
    resource.relationships[this.relationshipName][this.property] = value;
    return resource;
  }

  transformResponse(endpoint, response) {
    return response.then((resource) => {
      endpoint.resource = resource;
      return resource.relationships[this.relationshipName][this.property];
    }).catch((error) => {
      throw error.relationships[this.relationshipName][this.property];
    });
  }
}
