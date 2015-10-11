import RelationshipDescription from "./RelationshipDescription.js";

export default class ListRelationshipDescription extends RelationshipDescription {
  constructor( description, name, ResourceClass, initialValues) {
    super( description, name, ResourceClass, initialValues);

    this.canCreate = false;
    this._linkTemplatePath = null;
  }

  initializerFactory(services) {
    return services.listRelationshipInitializerFactory;
  }

  serializerFactory(services) {
    return services.listResourceSerializerFactory;
  }

  mapperFactory(services) {
    return services.listResourceMapperFactory;
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
    var loadedDataEndpointFactory              = parent.services.loadedDataEndpointFactory;
    var individualFromListTransformerFactory   = parent.services.individualFromListTransformerFactory;
    var embeddedRelationshipTransformerFactory = parent.services.embeddedRelationshipTransformerFactory;

    var parentEndpoint = parent.self();
    var transformer;
    uriParams = this.hasParams(uriParams);
    if (uriParams) {
      transformer = individualFromListTransformerFactory(this.name, uriParams);
    } else {
      transformer = embeddedRelationshipTransformerFactory(this.name);
    }
    return loadedDataEndpointFactory(parentEndpoint, parent, transformer);
  }

  listResourceTransformer(parent) {
    var primaryResourceTransformerFactory = parent.services.primaryResourceTransformerFactory;
    var mapperFactory                     = parent.services.resourceMapperFactory;
    var serializerFactory                 = parent.services.resourceSerializerFactory;

    return primaryResourceTransformerFactory(mapperFactory, serializerFactory, this.ResourceClass);
  }

  singleResourceTransformer(parent) {
    var primaryResourceTransformerFactory = parent.services.primaryResourceTransformerFactory;
    var singleResourceMapperFactory       = parent.services.resourceMapperFactory;
    var singleResourceSerializerFactory   = parent.services.resourceSerializerFactory;

    return primaryResourceTransformerFactory(singleResourceMapperFactory,
      singleResourceSerializerFactory,
      this.ResourceClass);
  }

  linkedEndpoint(parent, uriParams) {
    var templatedUrlFactory              = parent.services.templatedUrlFactory;
    var resolvedEndpointFactory          = parent.services.resolvedEndpointFactory;
    var createResourceTransformerFactory = parent.services.createResourceTransformerFactory;
    var templatedUrlFromUrlFactory       = parent.services.templatedUrlFromUrlFactory;
    var singleResourceMapperFactory      = parent.services.resourceMapperFactory;
    var singleResourceSerializerFactory  = parent.services.resourceSerializerFactory;

    var url, templatedUrl, primaryResourceTransformer, createTransformer;

    var ResourceClass = this.ResourceClass;

    createTransformer = null;
    uriParams = this.hasParams(uriParams);
    if (uriParams && this._linkTemplatePath) {
      url = parent.pathGet(this._linkTemplatePath);
      templatedUrl = templatedUrlFactory(url, uriParams);
      primaryResourceTransformer = this.singleResourceTransformer(parent);
    } else {
      url = parent.pathGet(this.linksPath);
      templatedUrl = templatedUrlFromUrlFactory(url, url);
      templatedUrl.addDataPathLink(parent, this.linksPath);
      primaryResourceTransformer = this.listResourceTransformer(parent);
      if (this.canCreate) {
        createTransformer = createResourceTransformerFactory(singleResourceMapperFactory,
          singleResourceSerializerFactory,
          this.ResourceClass);
      }
    }

    var endpoint = resolvedEndpointFactory(templatedUrl, primaryResourceTransformer, createTransformer);

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
        return new ResourceClass(this.services);
      };
    }
  }
}
