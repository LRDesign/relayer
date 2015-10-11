import ResourceTransformer from "./ResourceTransformer.js";

export default class EmbeddedRelationshipTransformer extends ResourceTransformer {
  constructor(services, relationshipName) {
    super(services);
    this.relationshipName = relationshipName;
  }

  transformRequest(endpoint, value) {
    var resource = endpoint.resource;
    resource.relationships[this.relationshipName] = value;
    return resource;
  }

  transformResponse(endpoint, response) {
    var self = this; // XXX shouldn't be necessary
    return response.then((resource) => {
      endpoint.resource = resource;
      return resource.relationships[self.relationshipName];
    }).catch((error) => {
      throw error.relationships[self.relationshipName];
    });
  }
}
