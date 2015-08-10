import Inflector                           from "xing-inflector";
import {ListResource}                      from "./ListResource.js";
import {TemplatedUrl, TemplatedUrlFromUrl} from "./TemplatedUrl.js";
import ResourceBuilder                     from "./ResourceBuilder.js";
import PrimaryResourceBuilder              from "./PrimaryResourceBuilder.js";
import ResourceDescription                 from "./ResourceDescription.js";
import RelationshipUtilities               from "./RelationshipUtilities.js"; //XXX not sure what to do with this

import * as Mappers from "./mappers.js";
import * as Serializers from "./serializers.js";
import * as Decs from "./decorators.js";
import * as RelDescs from "./relationshipDescriptions.js";
import * as Endpoints from "./endpoints.js";
import * as Initializers from "./initializers.js";
import * as Transformers from "./transformers.js";

export default class ServiceLocator {
  constructor() {
    this.memos = {};
  }

  // tools
  injectSelf(buildClass, ...args){
    return new buildClass(this, ...args);
  }

  memoize(name, builder) {
    if(!memos[name]) {
      memos[name] = builder();
    }
    return memos[name];
  }

  get inflector() { return this.memos("inflector", () => {return new Inflector();}); }

  ListResourceFactory(...args)                              { return this.injectSelf(ListResource, ...args); }

  templatedUrlFactory (...args)                             { return this.injectSelf(TemplatedUrl, ...args); }
  templatedUrlFromUrlFactory (...args)                      { return this.injectSelf(TemplatedUrlFromUrl, ...args); }

  resourceBuilderFactory (...args)                          { return this.injectSelf(ResourceBuilder, ...args); }
  primaryResourceBuilderFactory (...args)                   { return this.injectSelf(PrimaryResourceBuilder, ...args); }

  resourceDescriptionFactory (...args)                      { return this.injectSelf(ResourceDescription, ...args); }

  manyRelationshipInitializer(ResourceClass, initialValues) { return this.injectSelf(Initializers.ManyRelationshipInitializer, ...args); }
  singleRelationshipInitializerFactory(...args)             { return this.injectSelf(Initializers.SingleRelationshipInitializer, ...args); }
  relationshipInitializerFactory (...args)                  { return this.injectSelf(Initializers.RelationshipInitializer, ...args); }

  manyResourceMapperFactory(...args)                        { return this.injectSelf(Mappers.ManyResourceMapper, ...args); }
  resourceMapperFactory (...args)                           { return this.injectSelf(Mappers.ResourceMapper, ...args); }

  resourceSerializerFactory (...args)                       { return this.injectSelf(Serializers.ResourceSerializer, ...args); }
  manyResourceSerializerFactory (...args)                   { return this.injectSelf(Serializers.ManyResourceSerializer, ...args); }

  jsonPropertyDecoratorFactory (...args)                    { return this.injectSelf(Decs.JsonPropertyDecorator, ...args); }
  relatedResourceDecoratorFactory (...args)                 { return this.injectSelf(Decs.RelatedResourceDecorator, ...args); }

  singleRelationshipDescriptionFactory (...args)            { return this.injectSelf(RelDescs.SingleRelationshipDescription, ...args); }
  manyRelationshipDescriptionFactory (...args)              { return this.injectSelf(RelDescs.ManyRelationshipDescription, ...args); }
  listRelationshipDescriptionFactory (...args)              { return this.injectSelf(RelDescs.ListRelationshipDescription, ...args); }
  mapRelationshipDescriptionFactory (...args)               { return this.injectSelf(RelDescs.MapRelationshipDescription, ...args); }

  resolvedEndpointFactory (...args)                         { return this.injectSelf(Endpoints.ResolvedEndpoint, ...args); }
  promiseEndpointFactory (...args)                          { return this.injectSelf(Endpoints.PromiseEndpoint, ...args); }
  loadedDataEndpointFactory (...args)                       { return this.injectSelf(Endpoints.LoadedDataEndpoint, ...args); }

  primaryResourceTransformerFactory (...args)               { return this.injectSelf(Transformers.PrimaryResourceTransformer, ...args); }
  throwErrorTransformerFactory (...args)                    { return this.injectSelf(Transformers.ThrowErrorTransformer, ...args); }
  embeddedPropertyTransformerFactory (...args)              { return this.injectSelf(Transformers.EmbeddedPropertyTransformer, ...args); }
  embeddedRelationshipTransformerFactory (...args)          { return this.injectSelf(Transformers.EmbeddedRelationshipTransformer, ...args); }
  individualFromListTransformerFactory (...args)            { return this.injectSelf(Transformers.IndividualFromListTransformer, ...args); }
  createResourceTransformerFactory (...args)                { return this.injectSelf(Transformers.CreateResourceTransformer, ...args); }
  singleFromManyTransformerFactory (...args)                { return this.injectSelf(Transformers.SingleFromManyTransformer, ...args); }


}
