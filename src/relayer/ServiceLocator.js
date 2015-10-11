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
    this.buildThenable = ((resolver) => new Promise(resolver));
  }

  get buildThenable(){ return this._buildThenable; }
  set buildThenable(builder){ this._buildThenable = builder; this.forget("promise"); return builder; }

  get baseUrl() { return this._baseUrl; }
  set baseUrl(url) { this._baseUrl = url; this.forget("urlHelper"); return url; }

  get inflector() { return this.memoize("inflector", () => new Inflector()); }
  get Promise()   { return this.memoize("promise",   () => { return wrapPromise(this.buildThenable); }); }
  get urlHelper() { return this.memoize("urlHelper", () => { return new UrlHelper(this.baseUrl); }); }

  get ListResource() { return ListResource; }

  get ListResourceFactory()                    { return this.applySelfToBuilder(ListResource); }

  get templatedUrlFactory()                    { return this.buildFn(TemplatedUrl); }
  get templatedUrlFromUrlFactory()             { return this.buildFn(TemplatedUrlFromUrl); }

  get resourceBuilderFactory()                 { return this.applySelfToBuilder(ResourceBuilder); }
  get primaryResourceBuilderFactory()          { return this.applySelfToBuilder(PrimaryResourceBuilder); }

  get resourceDescriptionFactory()             { return this.applySelfToBuilder(ResourceDescription); }

  get manyRelationshipInitializerFactory()     { return this.applySelfToBuilder(Initializers.ManyRelationshipInitializer); }
  get singleRelationshipInitializerFactory()   { return this.applySelfToBuilder(Initializers.SingleRelationshipInitializer); }
  get listRelationshipInitializerFactory()     { return this.applySelfToBuilder(Initializers.ListRelationshipInitializer); }
  get mapRelationshipInitializerFactory()      { return this.applySelfToBuilder(Initializers.MapRelationshipInitializer); }

  get resourceMapperFactory()                  { return this.applySelfToBuilder(Mappers.ResourceMapper); }
  get manyResourceMapperFactory()              { return this.applySelfToBuilder(Mappers.ManyResourceMapper); }
  get listResourceMapperFactory()              { return this.applySelfToBuilder(Mappers.ListResourceMapper); }
  get mapResourceMapperFactory()               { return this.applySelfToBuilder(Mappers.MapResourceMapper); }

  get resourceSerializerFactory()              { return this.applySelfToBuilder(Serializers.ResourceSerializer); }
  get manyResourceSerializerFactory()          { return this.applySelfToBuilder(Serializers.ManyResourceSerializer); }
  get listResourceSerializerFactory()          { return this.applySelfToBuilder(Serializers.ListResourceSerializer); }
  get mapResourceSerializerFactory()           { return this.applySelfToBuilder(Serializers.MapResourceSerializer); }

  get resolvedEndpointFactory()                { return this.applySelfToBuilder(Endpoints.ResolvedEndpoint); }
  get promiseEndpointFactory()                 { return this.applySelfToBuilder(Endpoints.PromiseEndpoint); }
  get loadedDataEndpointFactory()              { return this.applySelfToBuilder(Endpoints.LoadedDataEndpoint); }

  get primaryResourceTransformerFactory()      { return this.applySelfToBuilder(Transformers.PrimaryResourceTransformer); }
  get throwErrorTransformerFactory()           { return this.applySelfToBuilder(Transformers.ThrowErrorTransformer); }
  get embeddedPropertyTransformerFactory()     { return this.applySelfToBuilder(Transformers.EmbeddedPropertyTransformer); }
  get embeddedRelationshipTransformerFactory() { return this.applySelfToBuilder(Transformers.EmbeddedRelationshipTransformer); }
  get individualFromListTransformerFactory()   { return this.applySelfToBuilder(Transformers.IndividualFromListTransformer); }
  get createResourceTransformerFactory()       { return this.applySelfToBuilder(Transformers.CreateResourceTransformer); }
  get singleFromManyTransformerFactory()       { return this.applySelfToBuilder(Transformers.SingleFromManyTransformer); }
}
