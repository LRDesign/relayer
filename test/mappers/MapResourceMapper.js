import MapResourceMapper from "../../src/relayer/mappers/MapResourceMapper.js";
import ResourceMapper from "../../src/relayer/mappers/ResourceMapper.js";

describe("MapResourceMapper", function() {
  var ResourceClass,
    resources,
    templatedUrlFromUrlFactory,
    templatedUrl,
    templatedUrlDataPathSpy,
    primaryResourceBuilderFactory,
    resourceBuilderFactory,
    resourceMapperFactory,
    resourceSerializerFactory,
    mapResourceMapper,
    builtResources,
    transport

  beforeEach(function() {
    ResourceClass = function(resource) {
      this.pathGet = function(path) {
        if (path == "$.links.self") {
          return "/cheese/gouda"
        } else if (path == "$.data.cheese") {
          return {
            type: "gouda"
          };
        } else if (path == "$.links.awesome") {
          return "/awesome";
        }
      }
      this.response = resource;
    };

    ResourceClass.relationships = {
      "cheese": {
        mapperFactory: function(response, ResourceClass) {
          return {
            map() {
              return "cheese";
            }
          };
        },
        ResourceClass: {},
        dataPath: "$.data.cheese",
        linksPath: "$.links.cheese"
      },
      "awesome": {
        dataPath: "$.data.awesome",
        linksPath: "$.links.awesome"
      }
    }

    templatedUrl = {
      addDataPathLink(path) {
      }
    };

    templatedUrlDataPathSpy = spyOn(templatedUrl, "addDataPathLink").and.callThrough();

    templatedUrlFromUrlFactory = jasmine.createSpy("templatedUrlFromUrlFactory").and.returnValue(templatedUrl);

    resources = {
      bob: {
        propreties: "dummy"
      },
      jim: {
        propreties: "dummy"
      },
      jerry: {
        propreties: "dummy"
      }
    }

    resourceBuilderFactory = jasmine.createSpy("resourceBuilderFactory").and.callFake(function(thisTransport, thisResponse, thisMapperFactory, thisSerializerFactory, ThisResourceClass) {
      return {
        build(uriTemplate) {
          var resource = new ThisResourceClass(thisResponse);
          resource.uriTemplate = uriTemplate;
          return resource;
        }
      }
    });

    primaryResourceBuilderFactory = jasmine.createSpy("primaryResourceBuilderFactory").and.callFake(function(thisResponse, ThisResourceClass) {
      return {
        build(endpoint) {
          var resource = new ThisResourceClass(thisResponse);
          resource.endpoint = endpoint;
          return resource;
        }
      }
    });

    resourceMapperFactory = function(thisTransport, response, ThisResourceClass, thisMapperFactory, thisSerializerFactory) {
      return new ResourceMapper(templatedUrlFromUrlFactory,
        resourceBuilderFactory,
        primaryResourceBuilderFactory,
        thisTransport,
        response,
        ThisResourceClass,
        thisMapperFactory,
        thisSerializerFactory);
    }

    resourceSerializerFactory = function() {
      return "goodbye";
    }

    transport = {};

    mapResourceMapper = new MapResourceMapper(resourceMapperFactory, resourceSerializerFactory, transport, resources, ResourceClass)
  });

  describe("no url template", function() {
    beforeEach(function() {
      builtResources = mapResourceMapper.map();
    });

    it("should have the right properties", function() {
      expect(builtResources.bob.response).toEqual(resources.bob);
      expect(builtResources.bob.relationships["cheese"]).toEqual("cheese");
      expect(builtResources.bob.relationships["awesome"]).toEqual(templatedUrl);
      expect(builtResources.jim.response).toEqual(resources.jim);
      expect(builtResources.jim.relationships["cheese"]).toEqual("cheese");
      expect(builtResources.jim.relationships["awesome"]).toEqual(templatedUrl);
    });

    it("should setup the templatedUrl and relationship urls properly", function() {
      expect(templatedUrlFromUrlFactory.calls.count()).toEqual(3);
      expect(templatedUrlDataPathSpy.calls.count()).toEqual(3);
      expect(templatedUrlFromUrlFactory).toHaveBeenCalledWith("/awesome", "/awesome");
      expect(templatedUrlDataPathSpy).toHaveBeenCalledWith(builtResources.bob, "$.links.awesome");
    });

    it("should build the resources with the regular resource builder", function() {
      expect(resourceBuilderFactory.calls.count()).toEqual(3);
    });

  });

});
