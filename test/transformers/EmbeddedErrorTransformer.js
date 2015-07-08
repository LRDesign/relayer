/*import EmbeddedErrorTransformer from "resourceLayer/transformers/EmbeddedErrorTransformer.js"

describe("EmbeddedErrorTransformer", function() {
  var mockError, mockEndpoint, embeddedErrorTransformer, resolvedError;

  beforeEach(function() {


    mockEndpoint = {
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

    embeddedErrorTransformer = new EmbeddedErrorTransformer("$.data.cheese");
  });

  describe("transform response", function() {
    beforeEach(function(done) {
      embeddedErrorTransformer.transformResponse(mockEndpoint, mockError).catch(
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
});*/
