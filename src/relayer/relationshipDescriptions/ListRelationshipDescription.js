import RelationshipDescription from "./RelationshipDescription.js";
import {SimpleFactory} from "../SimpleFactoryInjector.js";

@SimpleFactory('ListRelationshipDescriptionFactory',
  ['ListRelationshipInitializerFactory',
  'ListResourceMapperFactory',
  'ListResourceSerializerFactory',
  'Inflector',
  "SingleRelationshipDescriptionFactory",
  "ListResource",
  'PrimaryResourceTransformerFactory',
  'EmbeddedRelationshipTransformerFactory',
  'IndividualFromListTransformerFactory',
  'CreateResourceTransformerFactory',
  'ResolvedEndpointFactory',
  'LoadedDataEndpointFactory',
  'TemplatedUrlFromUrlFactory',
  'TemplatedUrlFactory'])
export default class ListRelationshipDescription extends RelationshipDescription {
  constructor(relationshipInitializerFactory,
    resourceMapperFactory,
    resourceSerializerFactory,
    inflector,
    singleRelationshipDescriptionFactory,
    ListResource,
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

    this.singleRelationshipDescriptionFactory = singleRelationshipDescriptionFactory;
    this.ListResource = ListResource;
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

  get ListResourceClass() {
    return this._ListResourceClass || this.ListResource;
  }

  set ListResourceClass(ListResourceClass) {
    this._ListResourceClass = ListResourceClass
  }

  get linkTemplate() {
    return this._linkTemplatePath;
  }

  set linkTemplate(linkTemplate) {
    this._linkTemplatePath = `$.links.${this.inflector.underscore(linkTemplate)}`;
  }

  set linkTemplatePath(linkTemplatePath) {
    this._linkTemplatePath = linkTemplatePath;
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
    return this.primaryResourceTransformerFactory(this);
  }

  singleResourceTransformer() {
    return this.primaryResourceTransformerFactory(this.singleRelationshipDescriptionFactory("", this.ResourceClass));
  }

  get createRelationshipDescription() {
    return this.singleRelationshipDescriptionFactory("", this.ResourceClass);
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
        createTransformer = this.createResourceTransformerFactory(this.createRelationshipDescription);
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
