import ResolvedEndpoint from "../src/relayer/endpoints/ResolvedEndpoint.js";

describe("Endpoint", function() {

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

  });

  describe("ResolvedEndpoint", function() {

    describe("load", function() {
      beforeEach(function(done) {
        transportSpy = spyOn(transport, "get").and.callThrough();
        resolvedEndpoint.load((result) => {
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

    describe("update", function() {

      beforeEach(function(done) {
        transportSpy = spyOn(transport, "put").and.callThrough();
        resolvedEndpoint.update(mockData).then((result) => {
          resultData = result;
          done();
        });
      });

      it("should transform request to get the data", function() {
        expect(resourceTransformerRequestSpy).toHaveBeenCalledWith(resolvedEndpoint, mockData);
      });

      it("should put data to the server at the endpoint url", function() {
        expect(transportSpy).toHaveBeenCalledWith(templatedUrl.url, mockData, "456");
      });

      it("should transform the data in the response", function() {
        expect(resourceTransformerResponseSpy).toHaveBeenCalled();
      });

      it("should return the update resource", function() {
        expect(resultData).toEqual(mockData);
      });
    });

    describe("create", function() {
      beforeEach(function(done) {
        resourceTransformerRequestSpy = spyOn(createResourceTransformer, "transformRequest").and.callThrough();
        resourceTransformerResponseSpy = spyOn(createResourceTransformer, "transformResponse").and.callThrough();
        transportSpy = spyOn(transport, "post").and.callThrough();
        resolvedEndpoint.create(mockData).then((result) => {
          resultData = result;
          done();
        });
      });

      it("should transform request to get the data", function() {
        expect(resourceTransformerRequestSpy).toHaveBeenCalledWith(resolvedEndpoint, mockData);
      });

      it("should post data to the server at the endpoint url", function() {
        expect(transportSpy).toHaveBeenCalledWith(templatedUrl.url, mockData);
      });

      it("should transform the data in the response", function() {
        expect(resourceTransformerResponseSpy).toHaveBeenCalled();
      });

      it("should return the newly created resource", function() {
        expect(resultData).toEqual(mockData);
      });
    });

    describe("remove", function() {

      beforeEach(function(done) {
        transportSpy = spyOn(transport, "remove").and.callThrough();
        resolvedEndpoint.remove((result) => {
          done();
        });
      });

      it("should tell the server to remove the resource at the endpoint url", function() {
        expect(transportSpy).toHaveBeenCalledWith(templatedUrl.url);
      });
    });
  });
});
