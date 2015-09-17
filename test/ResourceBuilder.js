import ResourceBuilder from "../src/relayer/ResourceBuilder.js";

describe("ResourceBuilder", function() {
  var services,
  ResourceClass,
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
  transport;

  beforeEach(function() {
    ResourceClass = function(resource) {
      this.pathGet = function(path) {
        if (path == "$.links.self") {
          return "/cheese/gouda";
        }
      };
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

    primaryResourceTransformerFactory = jasmine.createSpy("primaryResourceTransformerFactory").and.returnValue(primaryResourceTransformer);

    throwErrorTransformer = {
      properties: "dummy"
    };

    throwErrorTransformerFactory = jasmine.createSpy("throwErrorTransformerFactory").and.returnValue(throwErrorTransformer);

    resource = {
      propreties: "dummy"
    };

    transport = {};

    mapperFactory = function() {
      return "hello";
    };

    serializerFactory = function() {
      return "goodbye";
    };

    services = {
      transport,
      templatedUrlFromUrlFactory,
      resolvedEndpointFactory,
      primaryResourceTransformerFactory,
      mapperFactory,
      serializerFactory,
      throwErrorTransformerFactory
    };

    resourceBuilder = new ResourceBuilder(
      services,
      resource,
      ResourceClass
    );
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
      expect(primaryResourceTransformerFactory).toHaveBeenCalledWith(mapperFactory,
                                                                     serializerFactory,
                                                                     ResourceClass);
                                                                     expect(throwErrorTransformerFactory).toHaveBeenCalled();
    });

    it("should setup the endpoint properly", function() {
      expect(resolvedEndpointFactory).toHaveBeenCalledWith( templatedUrl,
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
      expect(primaryResourceTransformerFactory).toHaveBeenCalledWith(
        mapperFactory,
        serializerFactory,
        ResourceClass);
        expect(throwErrorTransformerFactory).toHaveBeenCalled();
    });

    it("should setup the endpoint properly", function() {
      expect(resolvedEndpointFactory).toHaveBeenCalledWith(
        templatedUrl,
        primaryResourceTransformer,
        throwErrorTransformer);
    });
  });
});
