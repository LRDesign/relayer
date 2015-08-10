import RelationshipDescription from "./RelationshipDescription.js";

export default class SingleRelationshipDescription extends RelationshipDescription {
  constructor( services, name, ResourceClass, initialValues) {
    super( services, name, ResourceClass, initialValues);

    this.singleResourceMapperFactory            = services.resourceMapperFactory;
    this.singleResourceSerializerFactory        = services.resourceSerializerFactory;
    this.primaryResourceTransformerFactory      = services.primaryResourceTransformerFactory;
    this.embeddedRelationshipTransformerFactory = services.embeddedRelationshipTransformerFactory;
    this.individualFromListTransformerFactory   = services.individualFromListTransformerFactory;
    this.createResourceTransformerFactory       = services.createResourceTransformerFactory;
    this.resolvedEndpointFactory                = services.resolvedEndpointFactory;
    this.loadedDataEndpointFactory              = services.loadedDataEndpointFactory;
    this.templatedUrlFromUrlFactory             = services.templatedUrlFromUrlFactory;
    this.templatedUrlFactory                    = services.templatedUrlFactory;

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
