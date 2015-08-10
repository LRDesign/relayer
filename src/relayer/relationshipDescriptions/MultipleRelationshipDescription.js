import RelationshipDescription from "./RelationshipDescription.js";

export default class MultipleRelationshipDescription extends RelationshipDescription {
  constructor( services, name, ResourceClass, initialValues) {
    super( services, name, ResourceClass, initialValues );

    this.embeddedRelationshipTransformerFactory = services.embeddedRelationshipTransformerFactory;
    this.singleFromManyTransformerFactory       = services.singleFromManyTransformerFactory;
    this.loadedDataEndpointFactory              = services.loadedDataEndpointFactory;
  }

  embeddedEndpoint(parent, uriParams) {
    var parentEndpoint = parent.self();
    var transformer;
    if (typeof uriParams == 'string') {
      transformer = this.singleFromManyTransformerFactory(this.name, uriParams);
    } else {
      transformer = this.embeddedRelationshipTransformerFactory(this.name);
    }
    return this.loadedDataEndpointFactory(parentEndpoint, parent, transformer);
  }

  linkedEndpoint(parent, uriParams) {
    throw "Error: a many relationships must be embedded";
  }

}
