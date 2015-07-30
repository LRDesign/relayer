import RelationshipUtilities from "../src/relayer/RelationshipUtilities.js";
import {TemplatedUrlFromUrl} from "../src/relayer/TemplatedUrl.js";
import Resource from "../src/relayer/Resource.js";

class Something extends Resource {

}
describe("RelationshipUtilities", function() {
  var relationshipUtilities, resource, target, name;

  beforeEach(function() {
    resource = new Something({ data: {}, links: { cheese: ""}});
    Something.relationships[name] = {
      linksPath: "$.links.cheese"
    }
    target = {};

    name = "cheese";

    relationshipUtilities = new RelationshipUtilities();
  });

  describe("get", function() {
    beforeEach(function() {
      resource.relationships[name] = "Here's the cheese";
      relationshipUtilities.addMethods(target, resource, name);
    });

    it("should return the relationship", function() {
      expect(target.get()).toEqual("Here's the cheese");
    });
  });

  describe("present", function() {
    describe ("when present", function() {
      beforeEach(function() {
        resource.relationships[name] = "Here's the cheese";
        relationshipUtilities.addMethods(target, resource, name);
      });

      it("should be present", function() {
        expect(target.present()).toBe(true);
      });
    });

    describe ("when not present", function() {
      beforeEach(function() {
        relationshipUtilities.addMethods(target, resource, name);
      });

      it("should be present", function() {
        expect(target.present()).toBe(false);
      });
    });
  });

  describe("set", function() {
    beforeEach(function() {
      relationshipUtilities.addMethods(target, resource, name);
    });

    describe("for template url", function() {
      var initialTemplatedUrl, newTemplatedUrl, otherResource;
      beforeEach(function() {
        otherResource = new Something({data: {}, links: { cheese: "/cheese/5"}});
        initialTemplatedUrl = new TemplatedUrlFromUrl("/cheese/{cheese}", "/cheese/4");
        resource.relationships[name] = initialTemplatedUrl;
        initialTemplatedUrl.addDataPathLink(resource, "$.links.cheese", false);
        newTemplatedUrl = new TemplatedUrlFromUrl("/baggins/{name}", "/baggins/bilbo");
      });

      it("on reassignment it should disconnect the previous template url and connect to new url", function() {
        expect(resource.pathGet('$.links.cheese')).toEqual("/cheese/4");
        target.set(newTemplatedUrl);
        initialTemplatedUrl.addDataPathLink(otherResource, "$.links.cheese");
        expect(initialTemplatedUrl.url).toEqual("/cheese/5")
        expect(resource.relationships[name]).toEqual(newTemplatedUrl);
        expect(resource.pathGet('$.links.cheese')).toEqual("/baggins/bilbo");
      });

      it("on reassignment to empty it should set the link blank and disconnect", function() {
        target.set(undefined);
        initialTemplatedUrl.addDataPathLink(otherResource, "$.links.cheese");
        expect(initialTemplatedUrl.url).toEqual("/cheese/5")
        expect(resource.relationships[name]).toEqual(undefined);
        expect(resource.pathGet('$.links.cheese')).toEqual("");
      });

    });

    describe("nothing to template url", function() {
      var newTemplatedUrl;
      beforeEach(function() {
        newTemplatedUrl = new TemplatedUrlFromUrl("/baggins/{name}", "/baggins/bilbo");
      });

      it("on reassignment it should connect to new url", function() {
        target.set(newTemplatedUrl);
        expect(resource.relationships[name]).toEqual(newTemplatedUrl);
        expect(resource.pathGet('$.links.cheese')).toEqual("/baggins/bilbo");
      });
    });

    describe("for everything else", function() {
      beforeEach(function() {
        resource.relationships[name] = "awesome";
      });

      it("should simply reassign the relationship", function() {
        target.set("bogus");
        expect(resource.relationships[name]).toEqual("bogus")
      });
    });
  });

})
