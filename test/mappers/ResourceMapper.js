import ResourceMapper from "../../src/relayer/mappers/ResourceMapper.js";

describe("ResourceMapper", function() {
  var ResourceClass,
    resource,
    resourceMapper,
    resourceBuilderFactory,
    primaryResourceBuilderFactory,
    templatedUrl,
    templatedUrlFromUrlFactory,
    templatedUrlDataPathSpy,
    builtResource,
    mockEndpoint,
    transport,
    resourceMapperFactory,
    resourceSerializerFactory,
    primaryResourceTransformer,
    primaryResourceTransformerFactory,
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

    resource = {
      propreties: "dummy"
    };

    mockEndpoint = {};

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
          var thisResource = new ThisResourceClass(thisResponse);
          thisResource.endpoint = endpoint;
          return thisResource;
        }
      }
    });

    transport = {};

    resourceMapperFactory = function() {
      return "hello";
    }

    resourceSerializerFactory = function() {
      return "goodbye";
    }

    relationship = {
      ResourceClass: ResourceClass,
      mapperFactory: resourceMapperFactory,
      serializerFactory: resourceSerializerFactory
    }

    resourceMapper = new ResourceMapper(templatedUrlFromUrlFactory,
      resourceBuilderFactory,
      primaryResourceBuilderFactory,
      primaryResourceTransformerFactory,
      transport,
      resource,
      relationship);
  });

  describe("no url template", function() {
    beforeEach(function() {
      builtResource = resourceMapper.map();
    });

    it("should have the right properties", function() {
      expect(builtResource.response).toEqual(resource);
      expect(builtResource.relationships["cheese"]).toEqual("cheese");
      expect(builtResource.relationships["awesome"]).toEqual(templatedUrl);
    });

    it("should setup templated url relationships properly", function() {
      expect(templatedUrlFromUrlFactory).toHaveBeenCalledWith("/awesome", "/awesome");
      expect(templatedUrlDataPathSpy).toHaveBeenCalledWith(builtResource, "$.links.awesome");
    });


    it("should setup the primary resource transformer", function() {
      expect(primaryResourceTransformerFactory).toHaveBeenCalledWith(relationship)
    })

    it("should build the resource with the regular resource builder", function() {
      expect(resourceBuilderFactory).toHaveBeenCalledWith(transport,
        resource,
        primaryResourceTransformer,
        ResourceClass);
    });
  });


  describe("with url template", function() {
    beforeEach(function() {
      resourceMapper.uriTemplate = "/cheese/{type}";
      builtResource = resourceMapper.map();
    });

    it("should have the right properties", function() {
      expect(builtResource.uriTemplate).toEqual("/cheese/{type}");
      expect(builtResource.response).toEqual(resource);
      expect(builtResource.relationships["cheese"]).toEqual("cheese");
      expect(builtResource.relationships["awesome"]).toEqual(templatedUrl);
    });
    it("should setup templated url relationships properly", function() {
      expect(templatedUrlFromUrlFactory).toHaveBeenCalledWith("/awesome", "/awesome");
      expect(templatedUrlDataPathSpy).toHaveBeenCalledWith(builtResource, "$.links.awesome");
    });

    it("should setup the primary resource transformer", function() {
      expect(primaryResourceTransformerFactory).toHaveBeenCalledWith(relationship)
    })

    it("should build the resource with the regular resource builder", function() {
      expect(resourceBuilderFactory).toHaveBeenCalledWith(transport,
        resource,
        primaryResourceTransformer,
        ResourceClass);
    })
  });

  describe("with endpoint", function() {
    beforeEach(function() {
      resourceMapper.endpoint = mockEndpoint;
      builtResource = resourceMapper.map();
    });

    it("should have the right properties", function() {
      expect(builtResource.endpoint).toEqual(mockEndpoint);
      expect(builtResource.response).toEqual(resource);
      expect(builtResource.relationships["cheese"]).toEqual("cheese");
      expect(builtResource.relationships["awesome"]).toEqual(templatedUrl);
    });
    it("should setup templated url relationships properly", function() {
      expect(templatedUrlFromUrlFactory).toHaveBeenCalledWith("/awesome", "/awesome");
      expect(templatedUrlDataPathSpy).toHaveBeenCalledWith(builtResource, "$.links.awesome");
    });

    it("should build the resource with the primary resource builder", function() {
      expect(primaryResourceBuilderFactory).toHaveBeenCalledWith(resource, ResourceClass);
    });
  });

});
