import RelationshipDescription from "./RelationshipDescription.js";
import ResourceMapper from "../mappers/ResourceMapper.js";
import ResourceSerializer from "../serializers/ResourceSerializer.js";
import PrimaryResourceTransformer from "../transformers/PrimaryResourceTransformer.js";
import EmbeddedRelationshipTransformer from "../transformers/EmbeddedRelationshipTransformer.js";
import IndividualFromListTranformer from "../transformers/IndividualFromListTransformer.js";
import CreateResourceTransformer from "../transformers/CreateResourceTransformer.js";
import ResolvedEndpoint from "../endpoints/ResolvedEndpoint.js";
import LoadedDataEndpoint from "../endpoints/LoadedDataEndpoint.js";
import {TemplatedUrl, TemplatedUrlFromUrl} from "../TemplatedUrl.js";
import makeFac from "../dumbMetaFactory.js";

export default class SingleRelationshipDescription extends RelationshipDescription {
  constructor(
    name,
    ResourceClass,
    initialValues,

    singleResourceMapperFactory = makeFac(ResourceMapper),
    singleResourceSerializerFactory = makeFac(ResourceSerializer),
    primaryResourceTransformerFactory = makeFac(PrimaryResourceTransformer),
    embeddedRelationshipTransformerFactory = makeFac(EmbeddedRelationshipTransformer),
    individualFromListTransformerFactory = makeFac(IndividualFromListTransformer),
    createResourceTransformerFactory = makeFac(CreateResourceTransformer),
    resolvedEndpointFactory = makeFac(ResolvedEndpoint),
    loadedDataEndpointFactory = makeFac(LoadedDataEndpoint),
    templatedUrlFromUrlFactory = makeFac(TemplatedUrlFromUrl),
    templatedUrlFactory = makeFac(TemplatedUrl),

    ...superArgs
  ) {


    super(name, ResourceClass, initialValues,
          ...superArgs);

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
