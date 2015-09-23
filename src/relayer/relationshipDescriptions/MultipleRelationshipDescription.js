import RelationshipDescription from "./RelationshipDescription.js";

export default class MultipleRelationshipDescription extends RelationshipDescription {
  embeddedEndpoint(parent, uriParams) {
    var embeddedRelationshipTransformerFactory = parent.services.embeddedRelationshipTransformerFactory;
    var singleFromManyTransformerFactory       = parent.services.singleFromManyTransformerFactory;
    var loadedDataEndpointFactory              = parent.services.loadedDataEndpointFactory;

    var parentEndpoint = parent.self();
    var transformer;
    if (typeof uriParams == 'string') {
      transformer = singleFromManyTransformerFactory(this.name, uriParams);
    } else {
      transformer = embeddedRelationshipTransformerFactory(this.name);
    }
    return loadedDataEndpointFactory(parentEndpoint, parent, transformer);
  }

  linkedEndpoint(parent, uriParams) {
    throw "Error: a many relationships must be embedded";
  }

}
