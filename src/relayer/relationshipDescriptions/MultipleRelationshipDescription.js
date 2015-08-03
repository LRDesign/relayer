import {
  default as RelationshipDescription,
  partialFactory as superFactory
} from "./RelationshipDescription.js";
import {factory as embeddedRelationshipTransformerFactory} from '../transformers/EmbeddedRelationshipTransformer.js';
import {factory as singleFromManyTransformerFactory} from '../transformers/SingleFromManyTransformer.js';
import {factory as loadedDataEndpointFactory} from '../endpoints/LoadedDataEndpoint.js';

export function partialFactory(name, ResourceClass, initialValues, subfactory) {
  return superFactory(name, ResourceClass, initialValues, (
      relationshipInitializerFactory,
      resourceMapperFactory,
      resourceSerializerFactory,
      inflector,
      name, ResourceClass, initialValues
  ) => {

    return subfactory( // TODO? reorder args so we can splat them
      relationshipInitializerFactory,
      resourceMapperFactory,
      resourceSerializerFactory,
      inflector,

      embeddedRelationshipTransformerFactory,
      singleFromManyTransformerFactory,
      loadedDataEndpointFactory,

      name, ResourceClass, initialValues
    );
  });
}

export function factory(name, ResourceClass, initialValues) {
  partialFactory(name, ResourceClass, initialValues, (...args) => {
    return new MultipleRelationshipDescription(...args);
  });
}

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
