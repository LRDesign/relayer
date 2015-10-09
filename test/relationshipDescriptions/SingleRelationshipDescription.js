import SingleRelationshipDescription from "../../src/relayer/relationshipDescriptions/SingleRelationshipDescription.js";

describe("SingleRelationshipDescription", function() {
  var relationshipInitializerFactory,
    resourceMapperFactory,
    resourceSerializerFactory,
    inflector,
    primaryResourceTransformerFactory,
    embeddedRelationshipTransformerFactory,
    resolvedEndpointFactory,
    loadedDataEndpointFactory,
    templatedUrlFactory,
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
        return { thisResourceClass, thisInitialValues }
      });

    resourceMapperFactory = jasmine.createSpy("resourceMapperFactory");

    resourceSerializerFactory = jasmine.createSpy("resourceSerializerFactory");

    inflector = {
      underscore: function(name) {
        return name;
      }
    }

    primaryResourceTransformerFactory = jasmine.createSpy("primaryResourceTransformerFactory").and.callFake(
      function(relationship) {
        return { relationship }
      });

    embeddedRelationshipTransformerFactory = jasmine.createSpy("embeddedRelationshipTransformerFactory").and.callFake(
      function(name) {
        return { name }
      });

    resolvedEndpointFactory = jasmine.createSpy("resolvedEndpointFactory").and.callFake(
      function(transport, templatedUrl, transformers, createTransformers) {
        return {transport, templatedUrl, transformers, createTransformers}
      });

    loadedDataEndpointFactory = jasmine.createSpy("loadedDataEndpointFactory").and.callFake(
      function(endpoint, resource, transformers) {
        return { endpoint, resource, transformers};
      });

    templatedUrlFactory = jasmine.createSpy("templatedUrlFactory").and.callFake(
      function(uriTemplate, uriParams) {
        return { uriTemplate, uriParams,
          addDataPathLink(resource, path) {
            this.dataPath = { resource, path }
          }
        }
      });

    name = "awesome";

    ResourceClass = function() {
      this.awesome = 'festering'
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
        if (path == "$.links.awesome") {
          return "/awesome";
        }
      }
    }
    singleRelationshipDescription = new SingleRelationshipDescription(
      relationshipInitializerFactory,
      resourceMapperFactory,
      resourceSerializerFactory,
      inflector,
      primaryResourceTransformerFactory,
      embeddedRelationshipTransformerFactory,
      resolvedEndpointFactory,
      loadedDataEndpointFactory,
      templatedUrlFactory,
      name,
      ResourceClass,
      initialValues);
  });

  it("should have the right initial values", function() {
    expect(singleRelationshipDescription.initializer).toEqual({
      thisResourceClass: ResourceClass,
      thisInitialValues: initialValues});
    expect(singleRelationshipDescription.mapperFactory).toEqual(resourceMapperFactory);
    expect(singleRelationshipDescription.serializerFactory).toEqual(resourceSerializerFactory);
    expect(singleRelationshipDescription.inflector).toEqual(inflector);
    expect(singleRelationshipDescription.primaryResourceTransformerFactory).toEqual(primaryResourceTransformerFactory);
    expect(singleRelationshipDescription.embeddedRelationshipTransformerFactory).toEqual(embeddedRelationshipTransformerFactory);
    expect(singleRelationshipDescription.resolvedEndpointFactory).toEqual(resolvedEndpointFactory);
    expect(singleRelationshipDescription.loadedDataEndpointFactory).toEqual(loadedDataEndpointFactory);
    expect(singleRelationshipDescription.templatedUrlFactory).toEqual(templatedUrlFactory);
    expect(singleRelationshipDescription.name).toEqual(name);
    expect(singleRelationshipDescription.ResourceClass).toEqual(ResourceClass);
    expect(singleRelationshipDescription.initialValues).toEqual(initialValues);
    expect(singleRelationshipDescription.async).toBe(true);
    expect(singleRelationshipDescription.linksPath).toEqual("$.links.awesome");
    expect(singleRelationshipDescription.dataPath).toEqual("$.data.awesome");
  });

  describe("embeddedEndpoint", function() {
    describe("standard", function() {
      var embeddedEndpoint;

      beforeEach(function() {
        embeddedEndpoint = singleRelationshipDescription.embeddedEndpoint(resource)
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
    })

    describe("templated", function() {
      var error;
      beforeEach(function() {
        singleRelationshipDescription.templated = true;
        try {
          singleRelationshipDescription.embeddedEndpoint(resource)
        } catch(err) {
          error = err;
        }
      });

      it("should error because a templated relationship cannot be embedded", function() {
        expect(error).toEqual("A templated hasOne relationship cannot be embedded")
      })
    })
  });

  describe("linkedEndpoint", function() {
    describe("standard", function() {
      var linkedEndpoint;
      beforeEach(function() {
        linkedEndpoint = singleRelationshipDescription.linkedEndpoint(resource)
      });

      it("should have the right values", function() {
        expect(linkedEndpoint.transport).toEqual(mockTransport);
        expect(linkedEndpoint.templatedUrl).toEqual({
          uriTemplate: "/awesome",
          uriParams: {},
          addDataPathLink: jasmine.any(Function),
          dataPath: {
            resource: resource,
            path: "$.links.awesome"
          }
        });
        expect(linkedEndpoint.transformers).toEqual(
          {
            relationship: singleRelationshipDescription
          });
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

    describe("templated", function() {
      var linkedEndpoint;
      beforeEach(function() {
        singleRelationshipDescription.templated = true
        linkedEndpoint = singleRelationshipDescription.linkedEndpoint(resource, {id: 4})
      });

      it("should have the right values", function() {
        expect(linkedEndpoint.transport).toEqual(mockTransport);
        expect(linkedEndpoint.templatedUrl).toEqual({
          uriTemplate: "/awesome",
          uriParams: {id: 4},
          addDataPathLink: jasmine.any(Function),
        });
        expect(linkedEndpoint.transformers).toEqual(
          {
            relationship: singleRelationshipDescription
          });
      });

      it("should setup the templated url", function() {
        expect(templatedUrlFactory).toHaveBeenCalledWith("/awesome", {id: 4});
      })

      it("should setup the right transformer", function() {
        expect(primaryResourceTransformerFactory).toHaveBeenCalled();
      });

      it("should setup the right endpoint", function() {
        expect(resolvedEndpointFactory).toHaveBeenCalled();
      });
    });
  });
});
