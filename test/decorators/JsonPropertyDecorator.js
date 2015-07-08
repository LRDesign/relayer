import JsonPropertyDecorator from "../../src/relayer/decorators/JsonPropertyDecorator.js"

describe("JsonPropertyDecorator", function() {
  var loadedDataEndpointFactory,
    embeddedPropertyTransformerFactory,
    promiseEndpointFactory,
    name,
    path,
    value,
    options,
    mockEndpoint,
    resource,
    jsonPropertyDecorator,
    loadedEndpoint;

  beforeEach(function() {

    loadedDataEndpointFactory = jasmine.createSpy("loadedDataEndpointFactory").and.callFake(
      function(endpoint, resource, transformers) {
        return { endpoint, resource, transformers };
      });

    embeddedPropertyTransformerFactory = jasmine.createSpy("embeddedPropertyTransformerFactory").and.callFake(
      function(path) {
        return { path };
      });

    promiseEndpointFactory = jasmine.createSpy("promiseEndpointFactory").and.callFake(
      function(endpointPromise) {
        return { endpointPromise }
      });

    name = "awesome";
    path = "$.data.awesome";
    value = "cheese";

    options = {
      afterSet() {
        this.setStuff = true;
      }
    }

    resource = {
      _awesome: "Festering",
      self() {
        return mockEndpoint;
      },
      setInitialValue(path, value) {
        this.initialValues = this.initialValues || {};
        this.initialValues[path] = value;
      },
      pathGet(path) {
        if (path == '$.data.awesome') {
          return this._awesome;
        }
      },
      pathSet(path, value) {
        if (path == '$.data.awesome' ) {
          this._awesome = value;
          return this._awesome;
        }
      }
    }

    mockEndpoint = {
      load() {
        return Promise.resolve(resource);
      }
    }

    jsonPropertyDecorator = new JsonPropertyDecorator(loadedDataEndpointFactory,
      embeddedPropertyTransformerFactory,
      promiseEndpointFactory,
      name,
      path,
      value,
      options);
  });

  describe("on resource", function() {
    beforeEach(function() {
      jsonPropertyDecorator.resourceApply(resource);
    });

    it("should set an initial value", function() {
      expect(resource.initialValues[path]).toEqual("cheese");
    });

    it("should setup a getter", function() {
      expect(resource.awesome).toEqual("Festering")
    });

    it("should setup a setter", function() {
      resource.awesome = "Hello";
      expect(resource._awesome).toEqual("Hello");
    });

    it("should call afterSet if passed", function() {
      resource.awesome = "Hello";
      expect(resource.setStuff).toBe(true);
    });
  });

  describe("on errors", function() {
    beforeEach(function() {
      jsonPropertyDecorator.errorsApply(resource);
    });

    it("should not set an initial value", function() {
      expect(resource.initialValues).toBe(undefined);
    });

    it("should setup a getter", function() {
      expect(resource.awesome).toEqual("Festering")
    });

    it("should setup a setter", function() {
      resource.awesome = "Hello";
      expect(resource._awesome).toEqual("Hello");
    });

    it("should call afterSet if passed", function() {
      resource.awesome = "Hello";
      expect(resource.setStuff).toBe(true);
    });
  });

  describe("on endpoint", function() {
    beforeEach(function(done) {
      jsonPropertyDecorator.endpointApply(mockEndpoint);
      mockEndpoint.awesome().endpointPromise.then((result) => {
        loadedEndpoint = result;
        done();
      });
    });

    it("should return the right values", function() {
      expect(loadedEndpoint.endpoint).toEqual(mockEndpoint);
      expect(loadedEndpoint.resource).toEqual(resource);
      expect(loadedEndpoint.transformers).toEqual([{path: '$.data.awesome'}])
    });

  });
});
