import PrimaryResourceBuilder from "../src/relayer/PrimaryResourceBuilder.js";

class PrimaryResource {
  constructor(response) {
    this.transport = null;
    this.templatedUrl = null;
    this.response = response;
  }
}

describe("PrimaryResourceBuilder", function() {
  var primaryResourceBuilder, mockEndpoint, mockTemplatedUrl, mockResponse, resource;
  var mockTemplatedUrlSpy;
  var services;

  beforeEach(function() {

    mockTemplatedUrl = {
      uriParams: { a: "awesome"},
      urlTemplate: "/awesome/{a}",
      url: "/awesome/awesome",
      addDataPathLink(resource, path) {
      }
    };

    mockTemplatedUrlSpy = spyOn(mockTemplatedUrl, "addDataPathLink").and.callThrough();

    mockResponse = {
      bilbo: "baggins"
    };

    mockEndpoint = {
      templatedUrl: mockTemplatedUrl
    };

    services = {};

    primaryResourceBuilder = new PrimaryResourceBuilder(services, mockResponse, PrimaryResource);
  });

  describe("build", function() {
    beforeEach(function() {
      resource = primaryResourceBuilder.build(mockEndpoint);
    });

    it("should build a resource of the given class", function() {
      expect(resource).toEqual(jasmine.any(PrimaryResource));
    });

    it("should build a resource with the right parameters and data", function() {
      expect(resource.templatedUrl).toEqual(mockTemplatedUrl);
      expect(resource.response).toEqual(mockResponse);
    });

    it("should add the path as a data link on the URLhelper", function() {
      expect(mockTemplatedUrlSpy).toHaveBeenCalledWith(resource, "$.links.self");
    });

    it("should setup self on the resource", function() {
      expect(resource.self()).toEqual(mockEndpoint);
    });
  });
});
