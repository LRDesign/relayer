import RelationshipDescription from "./RelationshipDescription.js";

export default class MultipleRelationshipDescription extends RelationshipDescription {
  constructor(relationshipInitializerFactory,
    resourceMapperFactory,
    resourceSerializerFactory,
    inflector,
    embeddedRelationshipTransformerFactory,
    singleFromManyTransformerFactory,
    loadedDataEndpointFactory,
    name,
    ResourceClass,
    initialValues) {

    super(relationshipInitializerFactory,
      resourceMapperFactory,
      resourceSerializerFactory,
      inflector,
      name,
      ResourceClass,
      initialValues);

    this.embeddedRelationshipTransformerFactory = embeddedRelationshipTransformerFactory;
    this.singleFromManyTransformerFactory = singleFromManyTransformerFactory;
    this.loadedDataEndpointFactory = loadedDataEndpointFactory;
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
