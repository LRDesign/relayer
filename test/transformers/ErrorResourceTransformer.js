/*import ErrorResourceTransformer from "resourceLayer/transformers/ErrorResourceTransformer.js";

class ErrorClass {
  constructor(response) {
    this.response = response;
  }
}

describe("ErrorResourceTransformer", function() {
  var errorResourceTransformer, mockEndpoint, mockTransport, mockTemplatedUrl, mockResponse, resource;
  var mockTemplatedUrlSpy;

  beforeEach(function() {

    mockResponse = {
      bilbo: "baggins"
    }

    mockEndpoint = {
    }

    errorResourceTransformer = new ErrorResourceTransformer(ErrorClass);
  });

  describe("transformResponse", function() {
    describe("on fail", function() {
      beforeEach(function(done) {
        var promise = Promise.reject(mockResponse);
        resource = errorResourceTransformer.transformResponse(mockEndpoint, promise);
        resource.catch((finalResource) => {
          resource = finalResource;
          done();
        });
      });

      it("should build a resource of an error class", function() {
        expect(resource).toEqual(jasmine.any(ErrorClass));
      });

      it("should build a resource with the right data", function() {
        expect(resource.response).toEqual(mockResponse);
      });

    });

    describe("on fail array", function() {
      beforeEach(function(done) {
        var promise = Promise.reject([mockResponse, mockResponse]);
        resource = errorResourceTransformer.transformResponse(mockEndpoint, promise);
        resource.catch((finalResource) => {
          resource = finalResource;
          done();
        });
      });

      it("should build an error class for each resource", function() {
        expect(resource.length).toEqual(2);
        expect(resource[0]).toEqual(jasmine.any(ErrorClass));
        expect(resource[1]).toEqual(jasmine.any(ErrorClass));
      });
    });
  });
});*/
