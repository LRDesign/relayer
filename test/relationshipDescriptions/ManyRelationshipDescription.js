import ManyRelationshipDescription from "../../src/relayer/relationshipDescriptions/ManyRelationshipDescription.js";

describe("ManyRelationshipDescription", function() {
  var services,
  description,
  manyRelationshipInitializerFactory,
  resourceMapperFactory,
  resourceSerializerFactory,
  inflector,
  primaryResourceTransformerFactory,
  embeddedRelationshipTransformerFactory,
  singleFromManyTransformerFactory,
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
  manyRelationshipDescription;

  beforeEach(function() {

    manyRelationshipInitializerFactory = jasmine.createSpy("manyRelationshipInitializerFactory").and.callFake(
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

    //singleResourceMapperFactory = jasmine.createSpy("singleResourceMapperFactory");

    //singleResourceSerializerFactory = jasmine.createSpy("singleResourceSerializerFactory");

    primaryResourceTransformerFactory = jasmine.createSpy("primaryResourceTransformerFactory").and.callFake(
      function(thisResourceMapperFactory, thisResourceSerializerFactory, thisResourceClass) {
      return { thisResourceMapperFactory, thisResourceSerializerFactory, thisResourceClass };
    });

    createResourceTransformerFactory = jasmine.createSpy("primaryResourceTransformerFactory").and.callFake(
      function(thisResourceMapperFactory, thisResourceSerializerFactory, thisResourceClass) {
      return { thisResourceMapperFactory, thisResourceSerializerFactory, thisResourceClass };
    });

    singleFromManyTransformerFactory = jasmine.createSpy("singleFromManyTransformerFactory").and.callFake(
      function(relationshipName, uriParams) {
      return {relationshipName, uriParams};
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

    templatedUrlFactory = jasmine.createSpy("templatedUrlFactory").and.callFake(
      function(uriTemplate, uriParams) {
      return { uriTemplate, uriParams };
    });

    name = "awesomes";

    ResourceClass = function() {
      this.awesome = 'festering';
    };

    ResourceClass.paramsFromShortLink = function(uriParams) {
      return {uriParams};
    };

    initialValues = { awesome: "cheese" };

    mockTransport = { http: "sucks" };

    mockEndpoint = {
      transport: mockTransport
    };

    services = {
      transport: mockTransport,
      manyRelationshipInitializerFactory,
      resourceMapperFactory,
      resourceSerializerFactory,
      primaryResourceTransformerFactory,
      embeddedRelationshipTransformerFactory,
      singleFromManyTransformerFactory,
      createResourceTransformerFactory,
      resolvedEndpointFactory,
      loadedDataEndpointFactory,
      templatedUrlFromUrlFactory,
      templatedUrlFactory,
    };

    description = {
      inflector
    };

    resource = {
      services,
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
    };
    linkTemplate = "awesome";

    manyRelationshipDescription = new ManyRelationshipDescription(
      description,
      name,
      ResourceClass,
      initialValues
    );
    manyRelationshipDescription.linkTemplate = linkTemplate;
  });

  it("should initialize a relationship", function(){
    expect(manyRelationshipDescription.initializer(services)).toEqual({
      thisResourceClass: ResourceClass,
      thisInitialValues: initialValues
    });
  });

  it("should have the right initial values", function() {
      expect(manyRelationshipDescription.inflector).toEqual(inflector);
      expect(manyRelationshipDescription.name).toEqual(name);
      expect(manyRelationshipDescription.ResourceClass).toEqual(ResourceClass);
      expect(manyRelationshipDescription.initialValues).toEqual(initialValues);
      expect(manyRelationshipDescription.async).toBe(true);
      expect(manyRelationshipDescription.linksPath).toEqual("$.links.awesomes");
      expect(manyRelationshipDescription.dataPath).toEqual("$.data.awesomes");

  });

  describe("embeddedEndpoint", function() {
    var embeddedEndpoint;

    describe("with string uriParams", function() {
      beforeEach(function() {
        embeddedEndpoint = manyRelationshipDescription.embeddedEndpoint(resource, "id");
      });

      it("should have the right values", function() {
        expect(embeddedEndpoint.endpoint).toEqual(mockEndpoint);
        expect(embeddedEndpoint.resource).toEqual(resource);
        expect(embeddedEndpoint.transformers).toEqual(
          {
          relationshipName: "awesomes",
          uriParams:  "id"
        });
      });

      it("should setup the right transformer", function() {
        expect(singleFromManyTransformerFactory).toHaveBeenCalled();
      });

      it("should setup the right endpoint", function() {
        expect(loadedDataEndpointFactory).toHaveBeenCalled();
      });
    });

    describe("with no uriParams", function() {
      beforeEach(function() {
        embeddedEndpoint = manyRelationshipDescription.embeddedEndpoint(resource);
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

    it('should throw an exception', function() {
      expect(function(){
        mapRelationshipDescription.linkedEndpoint(resource, "id");
      }).toThrow();
    });
  });

});
