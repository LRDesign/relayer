import ListRelationshipDescription from "../../src/relayer/relationshipDescriptions/ListRelationshipDescription.js";
import ListResource from "../../src/relayer/ListResource.js";

describe("ListRelationshipDescription", function() {
  var relationshipInitializerFactory,
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
    initialValues,
    mockTransport,
    mockEndpoint,
    resource,
    linkTemplate,
    listRelationshipDescription,
    singleRelationshipDescriptionFactory;

  beforeEach(function() {

    relationshipInitializerFactory = jasmine.createSpy("relationshipInitializerFactory").and.callFake(
      function (thisResourceClass, thisInitialValues) {
        return { thisResourceClass, thisInitialValues }
      });

    resourceMapperFactory = jasmine.createSpy("resourceMapperFactory");

    resourceSerializerFactory = jasmine.createSpy("resourceSerializerFactory");

    inflector = {
      underscore: function(name) {
        return name;
      }
    }

    singleResourceMapperFactory = jasmine.createSpy("singleResourceMapperFactory");

    singleResourceSerializerFactory = jasmine.createSpy("singleResourceSerializerFactory");

    primaryResourceTransformerFactory = jasmine.createSpy("primaryResourceTransformerFactory").and.callFake(
      function(relationship) {
        return { relationship }
      });

    createResourceTransformerFactory = jasmine.createSpy("primaryResourceTransformerFactory").and.callFake(
      function(relationship) {
        return { relationship }
      });

    embeddedRelationshipTransformerFactory = jasmine.createSpy("embeddedRelationshipTransformerFactory").and.callFake(
      function(name) {
        return { name }
      });

    individualFromListTransformerFactory = jasmine.createSpy("individualFromListTransformerFactory").and.callFake(
      function(relationshipName, uriParams) {
        return {relationshipName, uriParams}
      });

    resolvedEndpointFactory = jasmine.createSpy("resolvedEndpointFactory").and.callFake(
      function(transport, templatedUrl, transformers, createTransformers) {
        return {transport, templatedUrl, transformers, createTransformers}
      });

    loadedDataEndpointFactory = jasmine.createSpy("loadedDataEndpointFactory").and.callFake(
      function(endpoint, resource, transformers) {
        return { endpoint, resource, transformers};
      });

    templatedUrlFromUrlFactory = jasmine.createSpy("templatedUrlFromUrlFactory").and.callFake(
      function(uriTemplate, url) {
        return { uriTemplate, url,
          addDataPathLink(resource, path) {
            this.dataPath = { resource, path }
          }
        }
      });

    templatedUrlFactory = jasmine.createSpy("templatedUrlFactory").and.callFake(
      function(uriTemplate, uriParams) {
        return { uriTemplate, uriParams }
      });

    name = "awesomes";

    ResourceClass = function() {
      this.awesome = 'festering'
    }

    ResourceClass.paramsFromShortLink = function(uriParams) {
      return {uriParams};
    }

    initialValues = { awesome: "cheese" };

    mockTransport = { http: "sucks" }

    mockEndpoint = {
      transport: mockTransport
    }

    resource = {
      self() {
        return mockEndpoint;
      },
      pathGet(path) {
        if (path == "$.links.awesomes") {
          return "/awesomes";
        } else if (path == "$.links.awesome") {
          return "/awesomes/{id}";
        }
      }
    }
    linkTemplate = "awesome";

    singleRelationshipDescriptionFactory = function(name, ResourceClass) {
      return {
        ResourceClass: ResourceClass,
        mapperFactory: singleResourceMapperFactory,
        serializerFactory: singleResourceSerializerFactory
      }
    }

    listRelationshipDescription = new ListRelationshipDescription(
      relationshipInitializerFactory,
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
      initialValues);
    listRelationshipDescription.linkTemplate = linkTemplate;
  });

  it("should have the right initial values", function() {
    expect(listRelationshipDescription.initializer).toEqual({
      thisResourceClass: ResourceClass,
      thisInitialValues: initialValues});
    expect(listRelationshipDescription.mapperFactory).toEqual(resourceMapperFactory);
    expect(listRelationshipDescription.serializerFactory).toEqual(resourceSerializerFactory);
    expect(listRelationshipDescription.inflector).toEqual(inflector);
    expect(listRelationshipDescription.singleRelationshipDescriptionFactory).toEqual(singleRelationshipDescriptionFactory);
    expect(listRelationshipDescription.ListResource).toEqual(ListResource);
    expect(listRelationshipDescription.primaryResourceTransformerFactory).toEqual(primaryResourceTransformerFactory);
    expect(listRelationshipDescription.embeddedRelationshipTransformerFactory).toEqual(embeddedRelationshipTransformerFactory);
    expect(listRelationshipDescription.individualFromListTransformerFactory).toEqual(individualFromListTransformerFactory);
    expect(listRelationshipDescription.resolvedEndpointFactory).toEqual(resolvedEndpointFactory);
    expect(listRelationshipDescription.loadedDataEndpointFactory).toEqual(loadedDataEndpointFactory);
    expect(listRelationshipDescription.templatedUrlFromUrlFactory).toEqual(templatedUrlFromUrlFactory);
    expect(listRelationshipDescription.templatedUrlFactory).toEqual(templatedUrlFactory);
    expect(listRelationshipDescription.name).toEqual(name);
    expect(listRelationshipDescription.ResourceClass).toEqual(ResourceClass);
    expect(listRelationshipDescription.initialValues).toEqual(initialValues);
    expect(listRelationshipDescription.async).toBe(true);
    expect(listRelationshipDescription.canCreate).toBe(false);
    expect(listRelationshipDescription._linkTemplatePath).toBe("$.links.awesome");
    expect(listRelationshipDescription.linksPath).toEqual("$.links.awesomes");
    expect(listRelationshipDescription.dataPath).toEqual("$.data.awesomes");

  });

  describe("embeddedEndpoint", function() {
    var embeddedEndpoint;

    describe("with string uriParams", function() {
      beforeEach(function() {
        embeddedEndpoint = listRelationshipDescription.embeddedEndpoint(resource, "id")
      });

      it("should have the right values", function() {
        expect(embeddedEndpoint.endpoint).toEqual(mockEndpoint);
        expect(embeddedEndpoint.resource).toEqual(resource);
        expect(embeddedEndpoint.transformers).toEqual(
          {
            relationshipName: "awesomes",
            uriParams: {
              uriParams: "id"
            }
          });
      });

      it("should setup the right transformer", function() {
        expect(individualFromListTransformerFactory).toHaveBeenCalled();
      });

      it("should setup the right endpoint", function() {
        expect(loadedDataEndpointFactory).toHaveBeenCalled();
      });
    });

    describe("with object uriParams", function() {
      beforeEach(function() {
        embeddedEndpoint = listRelationshipDescription.embeddedEndpoint(resource, {id: "id"})
      });

      it("should have the right values", function() {
        expect(embeddedEndpoint.endpoint).toEqual(mockEndpoint);
        expect(embeddedEndpoint.resource).toEqual(resource);
        expect(embeddedEndpoint.transformers).toEqual(
          {
            relationshipName: "awesomes",
            uriParams: {
              id: "id"
            }
          });
      });

      it("should setup the right transformer", function() {
        expect(individualFromListTransformerFactory).toHaveBeenCalled();
      });

      it("should setup the right endpoint", function() {
        expect(loadedDataEndpointFactory).toHaveBeenCalled();
      });
    });

    describe("with no uriParams", function() {
      beforeEach(function() {
        embeddedEndpoint = listRelationshipDescription.embeddedEndpoint(resource)
      });

      it("should have the right values", function() {
        expect(embeddedEndpoint.endpoint).toEqual(mockEndpoint);
        expect(embeddedEndpoint.resource).toEqual(resource);
        expect(embeddedEndpoint.transformers).toEqual({name: "awesomes"});
      });

      it("should setup the right transformer", function() {
        expect(embeddedRelationshipTransformerFactory).toHaveBeenCalled();
      });

      it("should setup the right endpoint", function() {
        expect(loadedDataEndpointFactory).toHaveBeenCalled();
      });
    });
  });

  describe("linkedEndpoint", function() {
    var linkedEndpoint;

    describe("with string uriParams", function() {
      beforeEach(function() {
        linkedEndpoint = listRelationshipDescription.linkedEndpoint(resource, "id")
      });

      it("should have the right values", function() {
        expect(linkedEndpoint.transport).toEqual(mockTransport);
        expect(linkedEndpoint.templatedUrl).toEqual({
          uriTemplate: '/awesomes/{id}',
          uriParams: {uriParams: "id"}
        });
        expect(linkedEndpoint.transformers).toEqual(
          {
            relationship: {
              mapperFactory: singleResourceMapperFactory,
              serializerFactory: singleResourceSerializerFactory,
              ResourceClass: ResourceClass
            }
          });
        expect(linkedEndpoint.createTransformers).toBe(null);
      });

      it("should setup the templated url", function() {
        expect(templatedUrlFactory).toHaveBeenCalled();
      })
      it("should setup the right transformer", function() {
        expect(primaryResourceTransformerFactory).toHaveBeenCalled();
      });

      it("should setup the right endpoint", function() {
        expect(resolvedEndpointFactory).toHaveBeenCalled();
      });
    });

    describe("with object uriParams", function() {
      beforeEach(function() {
        linkedEndpoint = listRelationshipDescription.linkedEndpoint(resource, {id: "id"})
      });

      it("should have the right values", function() {
        expect(linkedEndpoint.transport).toEqual(mockTransport);
        expect(linkedEndpoint.templatedUrl).toEqual({
          uriTemplate: '/awesomes/{id}',
          uriParams: {id: "id"}
        });
        expect(linkedEndpoint.transformers).toEqual(
          {
            relationship: {
              mapperFactory: singleResourceMapperFactory,
              serializerFactory: singleResourceSerializerFactory,
              ResourceClass: ResourceClass
            }
          });
        expect(linkedEndpoint.createTransformers).toBe(null);
      });

      it("should setup the templated url", function() {
        expect(templatedUrlFactory).toHaveBeenCalled();
      })
      it("should setup the right transformer", function() {
        expect(primaryResourceTransformerFactory).toHaveBeenCalled();
      });

      it("should setup the right endpoint", function() {
        expect(resolvedEndpointFactory).toHaveBeenCalled();
      });
    });

    describe("with no uriParams", function() {
      beforeEach(function() {
        listRelationshipDescription.canCreate = true;
        linkedEndpoint = listRelationshipDescription.linkedEndpoint(resource)
      });

      it("should have the right values", function() {
        expect(linkedEndpoint.transport).toEqual(mockTransport);
        expect(linkedEndpoint.templatedUrl).toEqual({
          uriTemplate: "/awesomes",
          url: "/awesomes",
          addDataPathLink: jasmine.any(Function),
          dataPath: {
            resource: resource,
            path: "$.links.awesomes"
          }
        });
        expect(linkedEndpoint.transformers).toEqual(
          {
            relationship: listRelationshipDescription
          });
        expect(linkedEndpoint.createTransformers).toEqual(
          {
            relationship: {
              mapperFactory: singleResourceMapperFactory,
              serializerFactory: singleResourceSerializerFactory,
              ResourceClass: ResourceClass
            }
          });
        expect(linkedEndpoint.new()).toEqual(new ResourceClass());
      });

      it("should setup the templated url", function() {
        expect(templatedUrlFromUrlFactory).toHaveBeenCalled();
      })
      it("should setup the right transformer", function() {
        expect(primaryResourceTransformerFactory).toHaveBeenCalled();
      });

      it("should setup the right create transformer", function() {
        expect(createResourceTransformerFactory).toHaveBeenCalled();
      });
      it("should setup the right endpoint", function() {
        expect(resolvedEndpointFactory).toHaveBeenCalled();
      });
    });
  });

});
