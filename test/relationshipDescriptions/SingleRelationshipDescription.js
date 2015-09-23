import SingleRelationshipDescription from "../../src/relayer/relationshipDescriptions/SingleRelationshipDescription.js";

describe("SingleRelationshipDescription", function() {
  var services,
  relationshipInitializerFactory,
    resourceMapperFactory,
    resourceSerializerFactory,
    inflector,
    primaryResourceTransformerFactory,
    embeddedRelationshipTransformerFactory,
    resolvedEndpointFactory,
    loadedDataEndpointFactory,
    templatedUrlFromUrlFactory,
    name,
    ResourceClass,
    initialValues,
    mockTransport,
    mockEndpoint,
    resource,
    linkTemplate,
    singleRelationshipDescription;

  beforeEach(function() {

    relationshipInitializerFactory = jasmine.createSpy("relationshipInitializerFactory").and.callFake(
      function (thisResourceClass, thisInitialValues) {
        return { thisResourceClass, thisInitialValues };
      });

    resourceMapperFactory = jasmine.createSpy("resourceMapperFactory");

    resourceSerializerFactory = jasmine.createSpy("resourceSerializerFactory");

    inflector = {
      underscore: function(name) {
        return name;
      }
    };

    primaryResourceTransformerFactory = jasmine.createSpy("primaryResourceTransformerFactory").and.callFake(
      function(thisResourceMapperFactory, thisResourceSerializerFactory, thisResourceClass) {
        return { thisResourceMapperFactory, thisResourceSerializerFactory, thisResourceClass };
      });

    embeddedRelationshipTransformerFactory = jasmine.createSpy("embeddedRelationshipTransformerFactory").and.callFake(
      function(name) {
        return { name };
      });

    resolvedEndpointFactory = jasmine.createSpy("resolvedEndpointFactory").and.callFake(
      function(templatedUrl, transformers, createTransformers) {
        return {templatedUrl, transformers, createTransformers};
      });

    loadedDataEndpointFactory = jasmine.createSpy("loadedDataEndpointFactory").and.callFake(
      function(endpoint, resource, transformers) {
        return { endpoint, resource, transformers};
      });

    templatedUrlFromUrlFactory = jasmine.createSpy("templatedUrlFromUrlFactory").and.callFake(
      function(uriTemplate, url) {
        return { uriTemplate, url,
          addDataPathLink(resource, path) {
            this.dataPath = { resource, path };
          }
        };
      });

    name = "awesome";

    ResourceClass = function() {
      this.awesome = 'festering';
    };

    initialValues = { awesome: "cheese" };

    mockTransport = { http: "sucks" };

    mockEndpoint = {
      transport: mockTransport
    };

    services = {
      transport: mockTransport,
      relationshipInitializerFactory,
      resourceMapperFactory,
      resourceSerializerFactory,
      inflector,
      primaryResourceTransformerFactory,
      embeddedRelationshipTransformerFactory,
      resolvedEndpointFactory,
      loadedDataEndpointFactory,
      templatedUrlFromUrlFactory
    };

    resource = {
      self() {
        return mockEndpoint;
      },
      pathGet(path) {
        if (path == "$.links.awesome") {
          return "/awesome";
        }
      },
      services
    };

    singleRelationshipDescription = new SingleRelationshipDescription(
      services,
      name,
      ResourceClass,
      initialValues
    );
  });

  it("should have the right initial values", function() {
    expect(singleRelationshipDescription.inflector).toEqual(inflector);
    expect(singleRelationshipDescription.name).toEqual(name);
    expect(singleRelationshipDescription.ResourceClass).toEqual(ResourceClass);
    expect(singleRelationshipDescription.initialValues).toEqual(initialValues);
    expect(singleRelationshipDescription.async).toBe(true);
    expect(singleRelationshipDescription.linksPath).toEqual("$.links.awesome");
    expect(singleRelationshipDescription.dataPath).toEqual("$.data.awesome");
  });

  describe("embeddedEndpoint", function() {
    var embeddedEndpoint;

    beforeEach(function() {
      embeddedEndpoint = singleRelationshipDescription.embeddedEndpoint(resource);
    });

    it("should have the right values", function() {
      expect(embeddedEndpoint.endpoint).toEqual(mockEndpoint);
      expect(embeddedEndpoint.resource).toEqual(resource);
      expect(embeddedEndpoint.transformers).toEqual({name: "awesome"});
    });

    it("should setup the right transformer", function() {
      expect(embeddedRelationshipTransformerFactory).toHaveBeenCalled();
    });

    it("should setup the right endpoint", function() {
      expect(loadedDataEndpointFactory).toHaveBeenCalled();
    });
  });

  describe("linkedEndpoint", function() {
    var linkedEndpoint;
    beforeEach(function() {
      linkedEndpoint = singleRelationshipDescription.linkedEndpoint(resource);
    });

    it("should have the right values", function() {
      expect(linkedEndpoint.templatedUrl).toEqual({
        uriTemplate: "/awesome",
        url: "/awesome",
        addDataPathLink: jasmine.any(Function),
        dataPath: {
          resource: resource,
          path: "$.links.awesome"
        }
      });

      expect(linkedEndpoint.transformers).toEqual({
        thisResourceMapperFactory: resourceMapperFactory,
        thisResourceSerializerFactory: resourceSerializerFactory,
        thisResourceClass: ResourceClass
      });
    });

    it("should setup the templated url", function() {
      expect(templatedUrlFromUrlFactory).toHaveBeenCalled();
    });

    it("should setup the right transformer", function() {
      expect(primaryResourceTransformerFactory).toHaveBeenCalled();
    });

    it("should setup the right endpoint", function() {
      expect(resolvedEndpointFactory).toHaveBeenCalled();
    });
  });
});
