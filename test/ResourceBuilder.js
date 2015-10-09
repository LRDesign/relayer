import ResourceBuilder from "../src/relayer/ResourceBuilder.js";

describe("ResourceBuilder", function() {
  var ResourceClass,
    resource,
    resolvedEndpointFactory,
    resolvedEndpoint,
    templatedUrlFromUrlFactory,
    primaryResourceTransformerFactory,
    throwErrorTransformerFactory,
    templatedUrl,
    templatedUrlDataPathSpy,
    mapperFactory,
    serializerFactory,
    primaryResourceTransformer,
    throwErrorTransformer,
    resourceBuilder,
    builtResource,
    transport,
    createResourceTransformer,
    createResourceTransformerFactory,
    relationshipDescription;

  beforeEach(function() {
    ResourceClass = function(resource) {
      this.pathGet = function(path) {
        if (path == "$.links.self") {
          return "/cheese/gouda"
        }
      }
      this.response = resource;
    };

    resolvedEndpoint = {
      properties: "dummy"
    };

    resolvedEndpointFactory = jasmine.createSpy("resolvedEndpointFactory").and.returnValue(resolvedEndpoint);

    templatedUrl = {
      addDataPathLink(path) {
      }
    };

    templatedUrlDataPathSpy = spyOn(templatedUrl, "addDataPathLink").and.callThrough();

    templatedUrlFromUrlFactory = jasmine.createSpy("templatedUrlFromUrlFactory").and.returnValue(templatedUrl);

    primaryResourceTransformer = {
      properties: "dummy"
    };

    throwErrorTransformer = {
      properties: "dummy"
    };

    throwErrorTransformerFactory = jasmine.createSpy("throwErrorTransformerFactory").and.returnValue(throwErrorTransformer);


    createResourceTransformer = {
      properties: "dummy"
    };

    createResourceTransformerFactory = jasmine.createSpy("createResourceTransformerFactory").and.returnValue(createResourceTransformer);

    resource = {
      propreties: "dummy"
    };

    transport = {};

    relationshipDescription = {
      canCreate: false
    }
  });

  describe("standard", function() {
    beforeEach(function() {

      resourceBuilder = new ResourceBuilder(templatedUrlFromUrlFactory,
        resolvedEndpointFactory,
        throwErrorTransformerFactory,
        createResourceTransformerFactory,
        transport,
        resource,
        primaryResourceTransformer,
        ResourceClass,
        relationshipDescription);

    });

    describe("no url template", function() {
      beforeEach(function() {
        builtResource = resourceBuilder.build();
      });

      it("should have the right properties", function() {
        expect(builtResource.templatedUrl).toEqual(templatedUrl);
        expect(builtResource.response).toEqual(resource);
        expect(builtResource.self()).toEqual(resolvedEndpoint);
      });

      it("should setup the templatedUrl properly", function() {
        expect(templatedUrlFromUrlFactory).toHaveBeenCalledWith("/cheese/gouda", "/cheese/gouda");
        expect(templatedUrlDataPathSpy).toHaveBeenCalledWith(builtResource, "$.links.self");
      });

      it("should setup the transformers", function() {
        expect(throwErrorTransformerFactory).toHaveBeenCalled();
      });

      it("should setup the endpoint properly", function() {
        expect(resolvedEndpointFactory).toHaveBeenCalledWith(transport,
          templatedUrl,
          primaryResourceTransformer,
          throwErrorTransformer);
      });
    });


    describe("with url template", function() {
      beforeEach(function() {
        builtResource = resourceBuilder.build("/cheese/{type}");
      });

      it("should have the right properties", function() {
        expect(builtResource.templatedUrl).toEqual(templatedUrl);
        expect(builtResource.response).toEqual(resource);
        expect(builtResource.self()).toEqual(resolvedEndpoint);
      });

      it("should setup the templatedUrl properly", function() {
        expect(templatedUrlFromUrlFactory).toHaveBeenCalledWith("/cheese/{type}", "/cheese/gouda");
        expect(templatedUrlDataPathSpy).toHaveBeenCalledWith(builtResource, "$.links.self");
      });

      it("should setup the transformers", function() {
        expect(throwErrorTransformerFactory).toHaveBeenCalled();
      });

      it("should setup the endpoint properly", function() {
        expect(resolvedEndpointFactory).toHaveBeenCalledWith(
          transport,
          templatedUrl,
          primaryResourceTransformer,
          throwErrorTransformer);
      });
    });
  })

  describe("with resource that can create", function() {
    var createRelationshipDescription;

    beforeEach(function() {

      createRelationshipDescription = {
        awesome: true
      }

      relationshipDescription = {
        canCreate: true,
        createRelationshipDescription: createRelationshipDescription
      }

      resourceBuilder = new ResourceBuilder(templatedUrlFromUrlFactory,
        resolvedEndpointFactory,
        throwErrorTransformerFactory,
        createResourceTransformerFactory,
        transport,
        resource,
        primaryResourceTransformer,
        ResourceClass,
        relationshipDescription);

      builtResource = resourceBuilder.build("/cheese/{type}");
    });

    it("should have the right properties", function() {
      expect(builtResource.templatedUrl).toEqual(templatedUrl);
      expect(builtResource.response).toEqual(resource);
      expect(builtResource.self()).toEqual(resolvedEndpoint);
    });

    it("should setup the templatedUrl properly", function() {
      expect(templatedUrlFromUrlFactory).toHaveBeenCalledWith("/cheese/{type}", "/cheese/gouda");
      expect(templatedUrlDataPathSpy).toHaveBeenCalledWith(builtResource, "$.links.self");
    });

    it("should setup the transformers", function() {
      expect(createResourceTransformerFactory).toHaveBeenCalledWith(createRelationshipDescription);
    });

    it("should setup the endpoint properly", function() {
      expect(resolvedEndpointFactory).toHaveBeenCalledWith(
        transport,
        templatedUrl,
        primaryResourceTransformer,
        createResourceTransformer);
    });
  });
});
