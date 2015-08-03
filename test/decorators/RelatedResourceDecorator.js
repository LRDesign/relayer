import RelatedResourceDecorator from "../../src/relayer/decorators/RelatedResourceDecorator.js";
import {TemplatedUrl} from "../../src/relayer/TemplatedUrl.js";

describe("RelatedResourceDecorator", function() {
  var promiseEndpointFactory,
  relationshipUtilities,
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
  returnedEndpoint,
  result;

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

    relationshipUtilities = {
      addMethods(target, resource, name) {
        target.awesome = "set it awesome";
      }
    }

    relatedResourceDecorator = new RelatedResourceDecorator(promiseEndpointFactory,
      relationshipUtilities,
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
            applied: true,
            awesome: "set it awesome"
          })
        });

        it("should setup utility methods", function() {
          expect(resource.awesome)
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
            applied: true,
            awesome: "set it awesome"
          })
        });

        it("the endpoint should be linked", function() {
          resource.awesome("cheese");
          expect(linkedEndpointSpy).toHaveBeenCalled();
        })

      });
      describe("missing", function() {
        describe("first call", function() {
          beforeEach(function() {

            resource.relationships["awesome"] = null;
            relatedResourceDecorator.resourceApply(resource);
            result = resource.awesome("cheese");
          });

          it("should record the relationship", function() {
            expect(OtherResourceClass.relationships["awesome"]).toEqual(relationship)
          });


          it("should setup the right endpoint", function() {
            expect(result).toEqual({endpointPromise: jasmine.any(Promise),
              applied: true,
              awesome: "set it awesome"
            });
          });

          describe("second call resolves", function() {
            beforeEach(function(done) {
              resource.relationships["awesome"] = { value: "is here"};
              result.endpointPromise.then((resolvedValue) => {
                result = resolvedValue;
                done();
              });
            });

            it("should return the resolved value at the endpoint after canonical is fetched", function() {
              expect(result).toEqual({
                thisResource: resource,
                uriParams: "cheese",
                applied: true,
                awesome: "set it awesome"
              });
            });
          });

          describe("second call still missing", function() {
            beforeEach(function(done) {
              result.endpointPromise.catch((error) => {
                result = error;
                done();
              });
            });

            it("throw an error that the relationship is missing", function() {
              expect(result).toEqual("Error: Unable to find relationship, even on canonical resource");
            });
          });
        });
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
            applied: true,
            awesome: "set it awesome"
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
