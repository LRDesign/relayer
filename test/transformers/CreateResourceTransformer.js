import CreateResourceTransformer from "../../src/relayer/transformers/CreateResourceTransformer.js";


describe("CreateResourceTransformer", function() {
  var createResourceTransformer, mockEndpoint, mockTransport, mockResponse, resource,
  primaryResourceMapperFactory, primaryResourceSerializerFactory, ResourceClass, response;
  var mockTemplatedUrlSpy, templatedUrl;

  beforeEach(function() {


    mockResponse = {
      data: {
        bilbo: "baggins"
      },
      etag: "123"
    }

    mockTransport = {

    }

    templatedUrl = {

    }

    mockEndpoint = {
      transport: mockTransport,
      templatedUrl: templatedUrl
    }

    ResourceClass = function(thisResponse) {
      this.response = thisResponse;
      this.templatedUrl = templatedUrl;
    };

    ResourceClass.errorClass = function(thisResponse) {
      this.error = thisResponse;
    };

    primaryResourceMapperFactory = jasmine.createSpy("primaryResourceMapperFactory").and.callFake(
      function(thisTransport, thisResponse, ThisResourceClass, thisEndpoint) {
      return {
        map() {
          return new ThisResourceClass(thisResponse);
        }
      }
    });

    primaryResourceSerializerFactory = jasmine.createSpy("primaryResourceSerializerFactory").and.callFake(
      function(thisResource) {
      return {
        serialize() {
          return thisResource.response;
        }
      }
    });

    resource = new ResourceClass(mockResponse);

    createResourceTransformer = new CreateResourceTransformer(primaryResourceMapperFactory,
      primaryResourceSerializerFactory,
      ResourceClass);

  });

  describe("transformResponse", function() {
    describe("on success", function() {
      beforeEach(function(done) {
        var promise = Promise.resolve(mockResponse);
        resource = createResourceTransformer.transformResponse(mockEndpoint, promise);
        resource.then((finalResource) => {
          resource = finalResource;
          done();
        });
      });

      it("should build a resource of the given class", function() {
        expect(resource).toEqual(jasmine.any(ResourceClass));
      });

      it("should build a resource with the right parameters and data", function() {
        expect(resource.response).toEqual(mockResponse.data);
      });

      it("should call the mapper with the right parameters", function() {
        expect(primaryResourceMapperFactory).toHaveBeenCalledWith(
          mockTransport,
          mockResponse.data,
          ResourceClass);
      });

      it("should set the etag", function() {
        expect(templatedUrl.etag).toEqual("123");
      });
    });

    describe("on error", function() {
      beforeEach(function(done) {
        var promise = Promise.reject(mockResponse);
        resource = createResourceTransformer.transformResponse(mockEndpoint, promise);
        resource.catch((finalResource) => {
          resource = finalResource;
          done();
        });
      });

      it("should build a resource of the given class", function() {
        expect(resource).toEqual(jasmine.any(ResourceClass.errorClass));
      });

      it("should build a resource with the right parameters and data", function() {
        expect(resource.error).toEqual(mockResponse.data);
      });

      it("should call the mapper with the right parameters", function() {
        expect(primaryResourceMapperFactory).toHaveBeenCalledWith(
          mockTransport,
          mockResponse.data,
          ResourceClass.errorClass);
      });
    });
  });

  describe("transformRequest", function() {
    beforeEach(function() {
      response = createResourceTransformer.transformRequest(mockEndpoint, resource);
    });

    it("should extract the response from the resource", function() {
      expect(response).toEqual(mockResponse);
    });

    it("should call the serializer", function() {
      expect(primaryResourceSerializerFactory).toHaveBeenCalledWith(resource);
    });
  });
});
