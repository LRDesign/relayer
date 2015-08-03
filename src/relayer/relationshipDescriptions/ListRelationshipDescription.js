import {default as RelationshipDescription, partialFactory as superFactory} from "./RelationshipDescription.js";
import {factory as singleResourceMapperFactory} from "../mappers/ResourceMapper.js";
import {factory as singleResourceSerializerFactory} from "../serializers/ResourceSerializer.js";
import {factory as primaryResourceTransformerFactory} from "../transformers/PrimaryResourceTransformer.js";
import {factory as embeddedRelationshipTransformerFactory} from "../transformers/EmbeddedRelationshipTransformer.js";
import {factory as individualFromListTranformerFactory} from "../transformers/IndividualFromListTransformer.js";
import {factory as createResourceTransformerFactory} from "../transformers/CreateResourceTransformer.js";
import {factory as resolvedEndpointFactory} from "../endpoints/ResolvedEndpoint.js";
import {factory as loadedDataEndpointFactory} from "../endpoints/LoadedDataEndpoint.js";
import {TemplatedUrlFactory, TemplatedUrlFromUrlFactory} from "../TemplatedUrl.js";

export function factory( name, ResourceClass, initialValues) {
  return superFactory(name, ResourceClass, initialValue, (
    relationshipInitializerFactory,
    resourceMapperFactory,
    resourceSerializerFactory,
    inflector,

    name, ResourceClass, initialValues
  ) => {
    return new SingleRelationshipDescription(
      relationshipInitializerFactory, resourceMapperFactory, resourceSerializerFactory, inflector,

      singleResourceMapperFactory, singleResourceSerializerFactory,
      primaryResourceTransformerFactory, embeddedRelationshipTransformerFactory,
      individualFromListTransformerFactory, createResourceTransformerFactory,
      resolvedEndpointFactory, loadedDataEndpointFactory,
      TemplatedUrlFromUrlFactory, TemplatedUrlFactory,

      name, ResourceClass, initialValues);
  });
}

export default class SingleRelationshipDescription extends RelationshipDescription {

  constructor(relationshipInitializerFactory,
    resourceMapperFactory,
    resourceSerializerFactory,
    inflector,
    singleResourceMapperFactory,
    singleResourceSerializerFactory,
    primaryResourceTransformerFactory,
    embeddedRelationshipTransformerFactory,
    individualFromListTransformerFactory,
    createResourceTransformerFactory,
    resolvedEndpointFactory,
    loadedDataEndpointFactory,
    templatedUrlFromUrlFactory,
    templatedUrlFactory,
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

    this.singleResourceMapperFactory = singleResourceMapperFactory;
    this.singleResourceSerializerFactory = singleResourceSerializerFactory;
    this.primaryResourceTransformerFactory = primaryResourceTransformerFactory;
    this.embeddedRelationshipTransformerFactory = embeddedRelationshipTransformerFactory;
    this.individualFromListTransformerFactory = individualFromListTransformerFactory;
    this.createResourceTransformerFactory = createResourceTransformerFactory;
    this.resolvedEndpointFactory = resolvedEndpointFactory;
    this.loadedDataEndpointFactory = loadedDataEndpointFactory;
    this.templatedUrlFromUrlFactory = templatedUrlFromUrlFactory;
    this.templatedUrlFactory = templatedUrlFactory;
    this.canCreate = false;
    this._linkTemplatePath = null;
  }

  get linkTemplate() {
    return this._linkTemplatePath;
  }

  set linkTemplate(linkTemplate) {
    this._linkTemplatePath = `$.links.${linkTemplate}`;
  }

  hasParams(uriParams) {
    if (typeof uriParams == 'string') {
      uriParams = this.ResourceClass.paramsFromShortLink(uriParams);
    }
    if (typeof uriParams == 'object' && Object.keys(uriParams).length > 0) {
      return uriParams;
    } else {
      return false;
    }
  }

  embeddedEndpoint(parent, uriParams) {
    var parentEndpoint = parent.self();
    var transformer;
    uriParams = this.hasParams(uriParams);
    if (uriParams) {
      transformer = this.individualFromListTransformerFactory(this.name, uriParams);
    } else {
      transformer = this.embeddedRelationshipTransformerFactory(this.name);
    }
    return this.loadedDataEndpointFactory(parentEndpoint, parent, transformer);
  }

  listResourceTransformer() {
    return this.primaryResourceTransformerFactory(this.mapperFactory,
      this.serializerFactory,
      this.ResourceClass);
  }

  singleResourceTransformer() {
    return this.primaryResourceTransformerFactory(this.singleResourceMapperFactory,
      this.singleResourceSerializerFactory,
      this.ResourceClass);
  }

  linkedEndpoint(parent, uriParams) {

    var transport = parent.self().transport;
    var url, templatedUrl, primaryResourceTransformer, createTransformer;

    var ResourceClass = this.ResourceClass;

    createTransformer = null;
    uriParams = this.hasParams(uriParams);
    if (uriParams && this._linkTemplatePath) {
      url = parent.pathGet(this._linkTemplatePath);
      templatedUrl = this.templatedUrlFactory(url, uriParams);
      primaryResourceTransformer = this.singleResourceTransformer();
    } else {
      url = parent.pathGet(this.linksPath);
      templatedUrl = this.templatedUrlFromUrlFactory(url, url);
      templatedUrl.addDataPathLink(parent, this.linksPath);
      primaryResourceTransformer = this.listResourceTransformer();
      if (this.canCreate) {
        createTransformer = this.createResourceTransformerFactory(this.singleResourceMapperFactory,
          this.singleResourceSerializerFactory,
          this.ResourceClass);
      }
    }

    var endpoint = this.resolvedEndpointFactory(transport, templatedUrl, primaryResourceTransformer, createTransformer);

    if (createTransformer) {
      endpoint.new = function() {
        return new ResourceClass();
      };
    }

    return endpoint;
  }

  decorateEndpoint(endpoint, uriParams) {
    var ResourceClass = this.ResourceClass;

    uriParams = this.hasParams(uriParams);

    if (!uriParams && this.canCreate) {
      endpoint.new = function() {
        return new ResourceClass();
      };
    }

  }

}
