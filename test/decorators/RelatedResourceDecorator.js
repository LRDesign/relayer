import RelatedResourceDecorator from "../../src/relayer/decorators/RelatedResourceDecorator.js";
import {TemplatedUrl} from "../../src/relayer/TemplatedUrl.js";

describe("RelatedResourceDecorator", function() {
  var promiseEndpointFactory,
  name,
  relationship,
  OtherResourceClass,
  ResourceClass,
  resourceDescription,
  linkedEndpointSpy,
  embeddedEndpointSpy,
  resource,
  mockEndpoint,
  relatedResourceDecorator,
  returnedEndpoint;

  beforeEach(function() {

    promiseEndpointFactory = jasmine.createSpy("promiseEndpointFactory").and.callFake(
      function(endpointPromise) {
        return { endpointPromise }
      });

    name = "awesome";

    resourceDescription = {
      applyToEndpoint(endpoint) {
        endpoint.applied = true;
      }
    }

    OtherResourceClass = function() {
      this.isPersisted = true;
      this.relationships = {
        "awesome": { value: "isHere" }
      };
      this.self = function() {
        return mockEndpoint;
      };
    }

    OtherResourceClass.relationships = {};

    ResourceClass = {
      resourceDescription: resourceDescription
    }

    relationship = {
      ResourceClass: ResourceClass,
      linkedEndpoint(thisResource, uriParams) {
        return {thisResource, uriParams};
      },
      embeddedEndpoint(thisResource, uriParams) {
        return {thisResource, uriParams};
      },
      decorateEndpoint(endpoint, uriParams) {
      }
    }

    linkedEndpointSpy = spyOn(relationship, "linkedEndpoint").and.callThrough();
    embeddedEndpointSpy = spyOn(relationship, "embeddedEndpoint").and.callThrough();

    resource = new OtherResourceClass();

    mockEndpoint = {
      load() {
        return Promise.resolve(resource);
      }
    }

    relatedResourceDecorator = new RelatedResourceDecorator(promiseEndpointFactory,
      name,
      relationship);
  });

  describe("resource", function() {
    describe("async", function() {
      beforeEach(function() {
        relationship.async = true;
      })
      describe("embedded", function() {
        beforeEach(function() {
          relatedResourceDecorator.resourceApply(resource);
        });

        it("should record the relationship", function() {
          expect(OtherResourceClass.relationships["awesome"]).toEqual(relationship)
        });

        it("should setup the right endpoint", function() {
          expect(resource.awesome("cheese")).toEqual({
            thisResource: resource,
            uriParams: "cheese",
            applied: true
          })
        });

        it("the endpoint should be embedded", function() {
          resource.awesome("cheese");
          expect(embeddedEndpointSpy).toHaveBeenCalled();
        })
      });
      describe("linked", function() {
        beforeEach(function() {
          resource.relationships["awesome"] = new TemplatedUrl("/cheese/{id}", {id: 4});
          relatedResourceDecorator.resourceApply(resource);
        });

        it("should record the relationship", function() {
          expect(OtherResourceClass.relationships["awesome"]).toEqual(relationship)
        });

        it("should setup the right endpoint", function() {
          expect(resource.awesome("cheese")).toEqual({
            thisResource: resource,
            uriParams: "cheese",
            applied: true
          })
        });

        it("the endpoint should be embedded", function() {
          resource.awesome("cheese");
          expect(linkedEndpointSpy).toHaveBeenCalled();
        })

      });
    });

    describe("not async", function() {
      describe("embedded", function() {
        beforeEach(function() {
          relatedResourceDecorator.resourceApply(resource);
        });

        it("should record the relationship", function() {
          expect(OtherResourceClass.relationships["awesome"]).toEqual(relationship)
        });

        it("should return the relationship", function() {
          expect(resource.awesome("value")).toEqual("isHere");
          expect(resource.awesome()).toEqual({value: "isHere"});
        });
      });

      describe("linked", function() {
        beforeEach(function() {
          resource.relationships["awesome"] = new TemplatedUrl("/cheese/{id}", {id: 4});
          relatedResourceDecorator.resourceApply(resource);
        });

        it("should record the relationship", function() {
          expect(OtherResourceClass.relationships["awesome"]).toEqual(relationship)
        });

        it("should raise an error", function() {
          var error;
          try {
            resource.awesome("error")
          }
          catch(err) {
            error = err;
          }
          expect(error).toEqual("Error: non-async relationships must be embedded");
        });
      });
    });
  });

  describe("error", function() {
    describe("embedded", function() {
      beforeEach(function() {
        relatedResourceDecorator.errorsApply(resource);
      });

      it("should return the relationship", function() {
        expect(resource.awesome("value")).toEqual("isHere");
        expect(resource.awesome()).toEqual({value: "isHere"});
      });
    });

    describe("linked", function() {
      beforeEach(function() {
        resource.relationships["awesome"] = new TemplatedUrl("/cheese/{id}", {id: 4});
        relatedResourceDecorator.errorsApply(resource);
      });

      it("should raise an error", function() {
        var error;
        try {
          resource.awesome("error")
        }
        catch(err) {
          error = err;
        }
        expect(error).toEqual("Error: non-async relationships must be embedded");
      });
    });
  });

  describe("endpoint", function() {
    describe("async", function() {
      beforeEach(function() {
        relationship.async = true;
        relatedResourceDecorator.resourceApply(resource);
        relatedResourceDecorator.endpointApply(mockEndpoint);
      });

      it("should have the right values", function() {
        expect(mockEndpoint.awesome()).toEqual({
          endpointPromise: jasmine.any(Promise),
          applied: true
        });
      });

      describe("resolved", function() {
        beforeEach(function(done) {
          mockEndpoint.awesome("cheese").endpointPromise.then((resolved) => {
            returnedEndpoint = resolved;
            done();
          });
        });

        it("should return the right endpoint", function() {
          expect(returnedEndpoint).toEqual({
            thisResource: resource,
            uriParams: "cheese",
            applied: true
          });
        });
      });

    });

    describe("not async", function() {
      beforeEach(function() {
        relatedResourceDecorator.endpointApply(mockEndpoint);
      });

      it("should have the right values", function() {
        expect(mockEndpoint.awesome()).toEqual({
          endpointPromise: jasmine.any(Promise),
          applied: true
        });
      });

      describe("resolved", function() {
        beforeEach(function(done) {
          mockEndpoint.awesome("cheese").endpointPromise.then((resolved) => {
            returnedEndpoint = resolved;
            done();
          });
        });

        it("should return the right endpoint", function() {
          expect(returnedEndpoint).toEqual({
            thisResource: resource,
            uriParams: "cheese",
            applied: true
          });
        });
      });

    });
  });
});
