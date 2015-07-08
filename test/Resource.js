import Resource from "../src/relayer/Resource.js";

class ResourceClass extends Resource {

}

class SubResourceClass extends ResourceClass {

}

class ResourceDescription {
  constructor() {
    this.parentDescription = null;
  }
  chainFrom(other) {
    this.parentDescription = other;
  }
}

describe("Resource", function() {
  describe("resourceDescription", function() {
    var resourceDescriptionFactory;

    beforeEach(function() {
      resourceDescriptionFactory = function() {
        return new ResourceDescription();
      };

      SubResourceClass.description(resourceDescriptionFactory);
    });

    it("should setup resourceDescription", function() {
      expect(SubResourceClass.resourceDescription).toEqual(jasmine.any(ResourceDescription));
    });

    it("should chain from the parent", function() {
      expect(SubResourceClass.resourceDescription.parentDescription).toEqual(ResourceClass.resourceDescription);
    });

    it("the parent should not chain", function() {
      expect(ResourceClass.resourceDescription.parentDescription).toEqual(null);
    });
  });
});
