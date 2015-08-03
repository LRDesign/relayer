import ResolvedEndpoint from "../src/relayer/endpoints/ResolvedEndpoint.js";
import PromiseEndpoint from "../src/relayer/endpoints/PromiseEndpoint.js";

describe("PromiseEndpoint", function() {

  var resolvedEndpoint,
    promiseEndpoint,
    templatedUrl,
    transport,
    transportSpy,
    resourceTransformer,
    createResourceTransformer,
    resourceTransformerResponseSpy,
    resourceTransformerRequestSpy,
    mockData,
    mockDataSpy,
    resultData;

  beforeEach(function() {

    templatedUrl = {
      url: "/pages/1",
      etag: "456"
    };

    mockData = {
      page: "awesome",
      func(awesome) {
        return "it's " + awesome;
      }
    };

    transport = {

      get(url){
        return Promise.resolve(mockData)
      },

      put(url, data) {
        return Promise.resolve(mockData)
      },

      post(url, data){
        return Promise.resolve(mockData)
      },

      remove(url){
        return Promise.resolve({});
      }
    };

    resourceTransformer = {
      transformResponse: function(endpoint, response) {
        return response.then(
          (data) => data
        );
      },

      transformRequest: function(endpoint, request) {
        return request;
      }

    }

    createResourceTransformer = {
      transformResponse: function(endpoint, response) {
        return response.then(
          (data) => data
        )
      },

      transformRequest: function(endpoint, request) {
        return request;
      }

    }
    resourceTransformerRequestSpy = spyOn(resourceTransformer, "transformRequest").and.callThrough();
    resourceTransformerResponseSpy = spyOn(resourceTransformer, "transformResponse").and.callThrough();

    resolvedEndpoint = new ResolvedEndpoint(Promise, transport, templatedUrl, resourceTransformer, createResourceTransformer)
    promiseEndpoint = new PromiseEndpoint(function() { return Promise.resolve(resolvedEndpoint) });

  });

  // verify passthrough functionality works
  describe("load", function() {

    beforeEach(function(done) {
      transportSpy = spyOn(transport, "get").and.callThrough();
      promiseEndpoint.load((result) => {
        resultData = result;
        done();
      });
    });

    it("should load data from the server at the endpoint url", function() {
      expect(transportSpy).toHaveBeenCalledWith(templatedUrl.url, "456");
    });

    it("should transform the data in the response", function() {
      expect(resourceTransformerResponseSpy).toHaveBeenCalled();
    });

    it("should return the results", function() {
      expect(resultData).toEqual(mockData);
    });
  });
});
