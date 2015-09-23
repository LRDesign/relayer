import Inflector                           from "xing-inflector";
import Locator                             from "./Locator.js";
import ListResource                        from "./ListResource.js";
import {TemplatedUrl, TemplatedUrlFromUrl} from "./TemplatedUrl.js";
import ResourceBuilder                     from "./ResourceBuilder.js";
import PrimaryResourceBuilder              from "./PrimaryResourceBuilder.js";
import ResourceDescription                 from "./ResourceDescription.js";
import RelationshipUtilities               from "./RelationshipUtilities.js"; //XXX not sure what to do with this
import wrapPromise                         from "./Promise.js";
import UrlHelper                           from "./UrlHelper.js";

import * as Mappers from "./mappers.js";
import * as Serializers from "./serializers.js";
import * as Endpoints from "./endpoints.js";
import * as Initializers from "./initializers.js";
import * as Transformers from "./transformers.js";

export default class ServiceLocator extends Locator {
  constructor() {
    super();
    this._buildThenable = ((resolver) => new Promise(resolver));
  }

  get inflector() { return this.memoize("inflector", () => new Inflector()); }
  get Promise()   { return this.memoize("promise",   () => wrapPromise(this._thenable)); }

  get ListResourceFactory()                    { return (...args) => this.injectSelf(ListResource, ...args); }
  get templatedUrlFactory()                    { return (...args) => this.injectSelf(TemplatedUrl, ...args); }
  get templatedUrlFromUrlFactory()             { return (...args) => this.injectSelf(TemplatedUrlFromUrl, ...args); }

  get resourceBuilderFactory()                 { return (...args) => this.injectSelf(ResourceBuilder, ...args); }
  get primaryResourceBuilderFactory()          { return (...args) => this.injectSelf(PrimaryResourceBuilder, ...args); }

  get resourceDescriptionFactory()             { return (...args) => this.injectSelf(ResourceDescription, ...args); }

  get manyRelationshipInitializerFactory()     { return (...args) => this.injectSelf(Initializers.ManyRelationshipInitializer, ...args); }
  get singleRelationshipInitializerFactory()   { return (...args) => this.injectSelf(Initializers.SingleRelationshipInitializer, ...args); }
  get relationshipInitializerFactory()         { return (...args) => this.injectSelf(Initializers.RelationshipInitializer, ...args); }

  get resourceMapperFactory()                  { return (...args) => this.injectSelf(Mappers.ResourceMapper, ...args); }
  get manyResourceMapperFactory()              { return (...args) => this.injectSelf(Mappers.ManyResourceMapper, ...args); }

  get resourceSerializerFactory()              { return (...args) => this.injectSelf(Serializers.ResourceSerializer, ...args); }
  get manyResourceSerializerFactory()          { return (...args) => this.injectSelf(Serializers.ManyResourceSerializer, ...args); }

  get resolvedEndpointFactory()                { return (...args) => this.injectSelf(Endpoints.ResolvedEndpoint, ...args); }
  get promiseEndpointFactory()                 { return (...args) => this.injectSelf(Endpoints.PromiseEndpoint, ...args); }
  get loadedDataEndpointFactory()              { return (...args) => this.injectSelf(Endpoints.LoadedDataEndpoint, ...args); }

  get primaryResourceTransformerFactory()      { return (...args) => this.injectSelf(Transformers.PrimaryResourceTransformer, ...args); }
  get throwErrorTransformerFactory()           { return (...args) => this.injectSelf(Transformers.ThrowErrorTransformer, ...args); }
  get embeddedPropertyTransformerFactory()     { return (...args) => this.injectSelf(Transformers.EmbeddedPropertyTransformer, ...args); }
  get embeddedRelationshipTransformerFactory() { return (...args) => this.injectSelf(Transformers.EmbeddedRelationshipTransformer, ...args); }
  get individualFromListTransformerFactory()   { return (...args) => this.injectSelf(Transformers.IndividualFromListTransformer, ...args); }
  get createResourceTransformerFactory()       { return (...args) => this.injectSelf(Transformers.CreateResourceTransformer, ...args); }
  get singleFromManyTransformerFactory()       { return (...args) => this.injectSelf(Transformers.SingleFromManyTransformer, ...args); }
}
