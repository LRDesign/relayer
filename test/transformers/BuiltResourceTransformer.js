/*import BuiltResourceTransformer from "resourceLayer/transformers/BuiltResourceTransformer.js";

describe("PrimaryResourceTransformer", function() {
  var builtResourceTransformer, mockEndpoint, mockResponse, resource, mockResourceBuilder, mockResourceBuilderSpy;

  beforeEach(function() {

    mockResponse = {
      bilbo: "baggins"
    }

    mockEndpoint = {
    }

    mockResourceBuilder = {
      build(response) {
        return {
          response: response
        };
      }
    }

    mockResourceBuilderSpy = spyOn(mockResourceBuilder, "build").and.callThrough();

    builtResourceTransformer = new BuiltResourceTransformer(mockResourceBuilder);
  });

  describe("transformResponse", function() {
    describe("on success", function() {
      beforeEach(function(done) {
        var promise = Promise.resolve(mockResponse);
        resource = builtResourceTransformer.transformResponse(mockEndpoint, promise);
        resource.then((finalResource) => {
          resource = finalResource;
          done();
        });
      });

      it("should call the resource builder to build the resource", function() {
        expect(mockResourceBuilderSpy).toHaveBeenCalledWith(mockResponse);
      });

      it("should should return the built resource", function() {
        expect(resource).toEqual({response: mockResponse});
      });
    });
  });

  describe("transformRequest", function() {
    beforeEach(function() {
      resource = {
        response: mockResponse
      }
      resource = builtResourceTransformer.transformRequest(mockEndpoint, resource);
    });

    it("should extract the response from the resource", function() {
      expect(resource).toEqual(mockResponse);
    });
  });
});*/
