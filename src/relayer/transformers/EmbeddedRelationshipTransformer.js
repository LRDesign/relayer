import ResourceTransformer from "./ResourceTransformer.js";

export default class EmbeddedRelationshipTransformer extends ResourceTransformer {
  constructor(relationshipName) {
    super();
    this.relationshipName = relationshipName;
  }

  transformRequest(endpoint, value) {
    var resource = endpoint.resource;
    resource.relationships[this.relationshipName] = value;
    return resource;
  }

  transformResponse(endpoint, response) {
    return response.then((resource) => {
      endpoint.resource = resource;
      return resource.relationships[this.relationshipName];
    }).catch((error) => {
      throw error.relationships[this.relationshipName];
    });
  }
}
