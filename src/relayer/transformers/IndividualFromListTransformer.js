import ResourceTransformer from "./ResourceTransformer.js";
import {TemplatedUrl} from "../TemplatedUrl.js";
import makeFac from "../dumbMetaFactory.js";

export default class IndividualFromListTransformer extends ResourceTransformer {
  constructor(
    relationshipName, uriParams,
    templatedUrlFactory = makeFac(TemplatedUrl)
  ) {
    super();
    this.templatedUrlFactory = templatedUrlFactory;
    this.relationshipName = relationshipName;
    this.uriParams = uriParams;
  }

  templatedUrl(relationship) {
    var template = relationship.resource.pathGet('$.links.template');
    var templatedUrl = this.templatedUrlFactory(template, this.uriParams);
    return templatedUrl.url;
  }

  findInRelationship(relationship) {
    var url = this.templatedUrl(relationship);
    return relationship.findIndex((resource) => (resource.pathGet('$.links.self') == url));
  }

  transformRequest(endpoint, value) {
    var resource = endpoint.resource;
    var elementIndex = this.findInRelationship(resource.relationships[this.relationshipName]);
    resource.relationships[this.relationshipName][elementIndex] = value;
    return resource;
  }

  transformResponse(endpoint, response) {
    return response.then((resource) => {
      endpoint.resource = resource;
      var elementIndex = this.findInRelationship(resource.relationships[this.relationshipName]);
      if (elementIndex == -1) {
        throw "Element Not Found In List";
      } else {
        return resource.relationships[this.relationshipName][elementIndex];
      }
    }).catch((error) => {
      throw resource.relationshipName[this.relationshipName];
    });
  }
}
