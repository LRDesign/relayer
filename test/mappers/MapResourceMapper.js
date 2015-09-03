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
    transport,
    primaryResourceTransformer,
    primaryResourceTransformerFactory,
    singleRelationshipFactory,
    relationship;

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

    resourceBuilderFactory = jasmine.createSpy("resourceBuilderFactory").and.callFake(function(thisTransport, thisResponse, thisPrimaryResourceTransformer, ThisResourceClass) {
      return {
        build(uriTemplate) {
          var thisResource = new ThisResourceClass(thisResponse);
          thisResource.uriTemplate = uriTemplate;
          return thisResource;
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

    primaryResourceTransformer = {
      properties: "dummy"
    };

    primaryResourceTransformerFactory = jasmine.createSpy("primaryResourceTransformerFactory").and.returnValue(primaryResourceTransformer);

    resourceMapperFactory = function(thisTransport, response, ThisResourceClass, thisMapperFactory, thisSerializerFactory) {
      return new ResourceMapper(templatedUrlFromUrlFactory,
        resourceBuilderFactory,
        primaryResourceBuilderFactory,
        primaryResourceTransformerFactory,
        thisTransport,
        response,
        ThisResourceClass,
        thisMapperFactory,
        thisSerializerFactory);
    }

    resourceSerializerFactory = function() {
      return "goodbye";
    }


    singleRelationshipFactory = function(name, thisResourceClass) {
      return {
        ResourceClass: thisResourceClass,
        mapperFactory: resourceMapperFactory,
        serializerFactory: resourceSerializerFactory
      }
    }

    relationship = {
      ResourceClass: ResourceClass
    }

    transport = {};

    mapResourceMapper = new MapResourceMapper(singleRelationshipFactory, transport, resources, relationship)
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
