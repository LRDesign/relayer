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

describe("initialValues", function() {
  it("should initialize to an empty array", function() {
    expect(ResourceClass.prototype.initialValues).toEqual([]);
  });

  it("should chain from parent but be it's own set", function() {
    ResourceClass.prototype.setInitialValue("$.data.path", "value");
    expect(SubResourceClass.prototype.initialValues).toEqual([{path: "$.data.path", value: "value"}]);
    SubResourceClass.prototype.setInitialValue("$.data.otherPath", "otherValue");
    expect(SubResourceClass.prototype.initialValues).toEqual([{path: "$.data.path", value: "value"},
      {path: "$.data.otherPath", value: "otherValue"}]);
    expect(ResourceClass.prototype.initialValues).toEqual([{path: "$.data.path", value: "value"}]);
  });

  it("should setup initial values for a new object", function() {
    var subResource = new SubResourceClass();
    expect(subResource._response).toEqual({data: { path: "value", otherPath: "otherValue"}, links: {}});
  });
});

describe("relationships initialization", function() {
  var relationshipDescription, initializationSpy, resource, initializer;

  beforeEach(function() {
    initializer = jasmine.createSpyObj("initializer", ["initialize"]);
    initializer.initialize.and.returnValue("awesome");

    relationshipDescription = {
      initializer(services) { return initializer; }
    };

    ResourceClass.relationships["coolRelationship"] = relationshipDescription;
  });

  describe("when initializeOnCreate is true", function() {
    beforeEach(function() {
      relationshipDescription.initializeOnCreate = true;
      resource = new ResourceClass();
    });

    it("should call the initializer and save the relationship", function() {
      expect(initializer.initialize).toHaveBeenCalled();
      expect(resource.relationships).toEqual({coolRelationship: "awesome"});
    });
  });

  describe("when initializeOnCreate is true", function() {
    beforeEach(function() {
      relationshipDescription.initializeOnCreate = false;
      resource = new ResourceClass();
    });

    it("should call the initializer and save the relationship", function() {
      expect(initializer.initialize).not.toHaveBeenCalled();
      expect(resource.relationships).toEqual({});
    });
  });
});
