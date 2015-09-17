import CreateResourceTransformer from "../../src/relayer/transformers/CreateResourceTransformer.js";
import standardMocks from "../../test_support/standardMocks.js";

describe("CreateResourceTransformer", function() {
  var createResourceTransformer, mockResponse, resource, response;
  var mocks;

  beforeEach(function() {
    mockResponse = {
      data: {
        bilbo: "baggins"
      },
      etag: "123"
    };


    mocks = standardMocks(jasmine);

    mocks.endpoint = mocks.endpoint;

    resource = new mocks.ResourceClass(mockResponse);

    createResourceTransformer = new CreateResourceTransformer(mocks.services,
                                                              mocks.ResourceClass,
                                                              mocks.primaryResourceMapperFactory,
                                                              mocks.primaryResourceSerializerFactory
                                                             );

  });

  describe("transformResponse", function() {
    describe("on success", function() {
      beforeEach(function(done) {
        var promise = Promise.resolve(mockResponse);
        resource = createResourceTransformer.transformResponse(mocks.endpoint, promise);
        resource.then(
          (finalResource) => {
          resource = finalResource;
          done();
        },
        (err) => {
          expect(err.stack).toBe(NaN);
          done();
        });
      });

      it("should build a resource of the given class", function() {
        expect(resource).toEqual(jasmine.any(mocks.ResourceClass));
      });

      it("should build a resource with the right parameters and data", function() {
        expect(resource.response).toEqual(mockResponse.data);
      });

      it("should call the mapper with the right parameters", function() {
        expect(mocks.primaryResourceMapperFactory).toHaveBeenCalledWith(
          mockResponse.data,
          mocks.ResourceClass);
      });

      it("should set the etag", function() {
        expect(mocks.templatedUrl.etag).toEqual("123");
      });
    });

    describe("on error", function() {
      beforeEach(function(done) {
        var promise = Promise.reject(mockResponse);
        resource = createResourceTransformer.transformResponse(mocks.endpoint, promise);
        resource.catch((finalResource) => {
          resource = finalResource;
          done();
        });
      });

      it("should build a resource of the given class", function() {
        expect(resource).toEqual(jasmine.any(mocks.ResourceClass.errorClass));
      });

      it("should build a resource with the right parameters and data", function() {
        expect(resource.error).toEqual(mockResponse.data);
      });

      it("should call the mapper with the right parameters", function() {
        expect(mocks.primaryResourceMapperFactory).toHaveBeenCalledWith(
          mockResponse.data,
          mocks.ResourceClass.errorClass);
      });
    });
  });

  describe("transformRequest", function() {
    beforeEach(function() {
      response = createResourceTransformer.transformRequest(mocks.endpoint, resource);
    });

    it("should extract the response from the resource", function() {
      expect(response).toEqual(mockResponse);
    });

    it("should call the serializer", function() {
      expect(mocks.primaryResourceSerializerFactory).toHaveBeenCalledWith(resource);
    });
  });
});
