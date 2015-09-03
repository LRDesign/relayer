import ManyResourceMapper from "../../src/relayer/mappers/ManyResourceMapper.js";
import ResourceMapper from "../../src/relayer/mappers/ResourceMapper.js";

describe("ManyResourceMapper", function() {
  var ResourceClass,
    resources,
    templatedUrlFromUrlFactory,
    templatedUrl,
    templatedUrlDataPathSpy,
    resourceBuilderFactory,
    primaryResourceBuilderFactory,
    resourceMapperFactory,
    resourceSerializerFactory,
    manyResourceMapper,
    builtResources,
    transport,
    primaryResourceTransformerFactory,
    primaryResourceTransformer,
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

    primaryResourceTransformer = {
      properties: "dummy"
    };

    primaryResourceTransformerFactory = jasmine.createSpy("primaryResourceTransformerFactory").and.returnValue(primaryResourceTransformer);

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

    resources = new Array(10);
    resources.fill({
      propreties: "dummy"
    }, 0, 10);

    transport = {};

    resourceMapperFactory = function(thisTransport, response, ThisResourceClass, thisMapperFactory, thisSerializerFactory) {
      return new ResourceMapper(templatedUrlFromUrlFactory,
        resourceBuilderFactory,
        primaryResourceBuilderFactory,
        primaryResourceTransformerFactory,
        thisTransport,
        response,
        ThisResourceClass,
        thisMapperFactory,
        thisSerializerFactory
        );
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

    manyResourceMapper = new ManyResourceMapper(singleRelationshipFactory, transport, resources, relationship)
  });

  describe("no url template", function() {
    beforeEach(function() {
      builtResources = manyResourceMapper.map();
    });

    it("should have the right properties", function() {
      expect(builtResources.length).toEqual(10);
      expect(builtResources[0].response).toEqual(resources[0]);
      expect(builtResources[0].relationships["cheese"]).toEqual("cheese");
      expect(builtResources[1].relationships["awesome"]).toEqual(templatedUrl);
      expect(builtResources[9].response).toEqual(resources[9]);
      expect(builtResources[9].relationships["cheese"]).toEqual("cheese");
      expect(builtResources[9].relationships["awesome"]).toEqual(templatedUrl);
    });

    it("should setup the templatedUrl and relationship urls properly", function() {
      expect(templatedUrlFromUrlFactory.calls.count()).toEqual(10);
      expect(templatedUrlDataPathSpy.calls.count()).toEqual(10);
      expect(templatedUrlFromUrlFactory).toHaveBeenCalledWith("/awesome", "/awesome");
      expect(templatedUrlDataPathSpy).toHaveBeenCalledWith(builtResources[0], "$.links.awesome");
    });

    it("should build the resources with the regular resource builder", function() {
      expect(resourceBuilderFactory.calls.count()).toEqual(10);
    });

  });

});
