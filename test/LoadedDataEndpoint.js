import LoadedDataEndpoint from "../src/relayer/endpoints/LoadedDataEndpoint.js";
import ResolvedEndpoint from "../src/relayer/endpoints/ResolvedEndpoint.js";

describe("LoadedDataEndpoint", function() {

  var loadedDataEndpoint,
    resolvedEndpoint,
    templatedUrl,
    transport,
    transportSpy,
    initialResourceTransformer,
    dataResourceTransformer,
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
        return Promise.resolve({data: mockData})
      },

      post(url, data){
        return Promise.resolve(mockData)
      },

      remove(url){
        return Promise.resolve({});
      }
    };

    initialResourceTransformer = {
      transformResponse: function(endpoint, response) {
        return response.then(
          (data) => {
            return {
              wrapped: data.data
            };
          }
        );
      },

      transformRequest: function(endpoint, request) {
        return request.wrapped;
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

    dataResourceTransformer = {
      transformResponse: function(endpoint, response) {
        return response.then((data) => data.wrapped.page)
      },

      transformRequest: function(endpoint, request) {
        mockData.page = request;
        return {
          wrapped: mockData
        };
      }
    }


    resourceTransformerRequestSpy = spyOn(dataResourceTransformer, "transformRequest").and.callThrough();
    resourceTransformerResponseSpy = spyOn(dataResourceTransformer, "transformResponse").and.callThrough();

    resolvedEndpoint = new ResolvedEndpoint(transport, templatedUrl, initialResourceTransformer, createResourceTransformer)
    loadedDataEndpoint = new LoadedDataEndpoint(resolvedEndpoint, { wrapped: mockData }, dataResourceTransformer)

  });

  describe("properties", function() {
    it("should apply request transforms before setting data", function() {
      // unwrapped
      expect(loadedDataEndpoint.data).toEqual(mockData);
      expect(loadedDataEndpoint.resourceTransformers).toEqual([
        initialResourceTransformer,
        dataResourceTransformer
        ]);
    });
  });

  describe("load", function() {
    beforeEach(function(done) {
      transportSpy = spyOn(transport, "get").and.callThrough();
      loadedDataEndpoint.load((result) => {
        resultData = result;
        done();
      });
    });

    it("should NOT load data from the server at the endpoint url", function() {
      expect(transportSpy).not.toHaveBeenCalledWith(templatedUrl.url);
    });

    it("should additionally transform the data in the response", function() {
      expect(resourceTransformerResponseSpy).toHaveBeenCalled();
    });

    it("should return the results", function() {
      expect(resultData).toEqual("awesome");
    });
  });

  describe("update", function() {

    beforeEach(function(done) {
      transportSpy = spyOn(transport, "put").and.callThrough();
      loadedDataEndpoint.update("cheese").then((result) => {
        resultData = result;
        done();
      });
    });

    it("should transform request to get the data", function() {
      expect(resourceTransformerRequestSpy).toHaveBeenCalledWith(loadedDataEndpoint, "cheese");
    });

    it("should put data to the server at the endpoint url", function() {
      expect(transportSpy).toHaveBeenCalledWith(templatedUrl.url, mockData);
    });

    it("should transform the data in the response", function() {
      expect(resourceTransformerResponseSpy).toHaveBeenCalled();
    });

    it("should return the updated resource", function() {
      expect(resultData).toEqual("cheese");
    });
  });

});
