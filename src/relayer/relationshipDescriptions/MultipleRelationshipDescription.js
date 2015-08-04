import RelationshipDescription from "./RelationshipDescription.js";
import EmbeddedRelationshipTransformer from '../transformers/EmbeddedRelationshipTransformer.js';
import SingleFromManyTransformer from '../transformers/SingleFromManyTransformer.js';
import LoadedDataEndpoint from '../endpoints/LoadedDataEndpoint.js';

export default class MultipleRelationshipDescription extends RelationshipDescription {
  constructor( name, ResourceClass, initialValues,
    embeddedRelationshipTransformerFactory = makeFac(EmbeddedRelationshipTransformer),
    singleFromManyTransformerFactory       = makeFac(SingleFromManyTransformer),
    loadedDataEndpointFactory              = makeFac(LoadedDataEndpoint),
    ...superArgs
  ) {

    super( name, ResourceClass, initialValues,
      ...superArgs
    );

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
