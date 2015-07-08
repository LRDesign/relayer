import EmbeddedPropertyTransformer from "../../src/relayer/transformers/EmbeddedPropertyTransformer.js"

describe("EmbeddedPropertyTransformer", function() {
  var mockDataWrapperFactory, mockData, mockRequest, mockResponse, mockError, mockEndpoint, embeddedPropertyTransformer, resolvedResponse, resolvedError, transformedRequest;

  beforeEach(function() {

    mockDataWrapperFactory = function(data) {
      return {
        data: data,
        pathGet(path) {
          if (path == "$.data.cheese") {
            return this.data.cheese;
          }
        },
        pathSet(path, value) {
          if (path == "$.data.cheese") {
            this.data.cheese = value;
          }
        }
      };
    };

    mockData = {
        cheese: "gouda"
    }

    mockEndpoint = {
      data: mockData,
      resource: mockDataWrapperFactory(mockData)
    }

    mockError = Promise.reject({
      data: {
        cheese: "gouda"
      },
      pathGet(path) {
        if (path == "$.data.cheese") {
          return this.data.cheese;
        }
      }
    });

    mockResponse = Promise.resolve(mockDataWrapperFactory({
      cheese: "gouda"
    }));

    mockRequest = "swiss";

    embeddedPropertyTransformer = new EmbeddedPropertyTransformer("$.data.cheese");
  });

  describe("transform request", function() {
    beforeEach(function() {
      transformedRequest = embeddedPropertyTransformer.transformRequest(mockEndpoint, mockRequest)
    });

    it("should transform the request", function() {
      expect(transformedRequest).toEqual({data: {cheese: "swiss"}, pathGet: jasmine.any(Function), pathSet: jasmine.any(Function)})
    });

    it("should alter the endpoint's data", function() {
      expect(mockEndpoint.data).toEqual({cheese: "swiss"});
    });
  });

  describe("transform response", function() {
    describe("on success", function() {
      beforeEach(function(done) {
        mockEndpoint.resource = null;
        embeddedPropertyTransformer.transformResponse(mockEndpoint, mockResponse).then(
          (response) => {
            resolvedResponse = response;
            done();
          }
        );
      });

      it("should resolve the reponse to the embedded property", function() {
        expect(resolvedResponse).toEqual("gouda");
      });

      it("should save the resource to reference later", function() {
        expect(mockEndpoint.resource).toEqual({data: {cheese: "gouda"}, pathGet: jasmine.any(Function), pathSet: jasmine.any(Function)})
      });
    })

    describe("on error", function() {
      beforeEach(function(done) {
        embeddedPropertyTransformer.transformResponse(mockEndpoint, mockError).catch(
          (error) => {
            resolvedError = error;
            done();
          }
        );
      });

      it("should resolve the reponse to the embedded property", function() {
        expect(resolvedError).toEqual("gouda");
      });
    });
  });

});
