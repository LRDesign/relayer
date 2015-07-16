import RelationshipDescription from "../../src/relayer/relationshipDescriptions/RelationshipDescription.js";

describe("RelationshipDescription", function() {
  var relationshipInitializerFactory,
    resourceMapperFactory,
    resourceSerializerFactory,
    inflector,
    resolvedEndpointFactory,
    name,
    ResourceClass,
    initialValues,
    relationshipDescription;

  beforeEach(function() {

    relationshipInitializerFactory = jasmine.createSpy("relationshipInitializerFactory").and.callFake(
      function (thisResourceClass, thisInitialValues) {
        return { thisResourceClass, thisInitialValues }
      });

    resourceMapperFactory = jasmine.createSpy("resourceMapperFactory");

    resourceSerializerFactory = jasmine.createSpy("resourceSerializerFactory");

    inflector = {
      underscore: function(name) {
        return name;
      }
    }

    name = "awesome";

    ResourceClass = function() {
      this.awesome = 'festering'
    }

    initialValues = { awesome: "cheese" };

    relationshipDescription = new RelationshipDescription(
      relationshipInitializerFactory,
      resourceMapperFactory,
      resourceSerializerFactory,
      inflector,
      name,
      ResourceClass,
      initialValues);
  });

  it("should have the right initial values", function() {
    expect(relationshipDescription.initializer).toEqual({
      thisResourceClass: ResourceClass,
      thisInitialValues: initialValues});
    expect(relationshipDescription.mapperFactory).toEqual(resourceMapperFactory);
    expect(relationshipDescription.serializerFactory).toEqual(resourceSerializerFactory);
    expect(relationshipDescription.inflector).toEqual(inflector);
    expect(relationshipDescription.name).toEqual(name);
    expect(relationshipDescription.ResourceClass).toEqual(ResourceClass);
    expect(relationshipDescription.initialValues).toEqual(initialValues);
    expect(relationshipDescription.async).toBe(true);
    expect(relationshipDescription.linksPath).toEqual("$.links.awesome");
    expect(relationshipDescription.dataPath).toEqual("$.data.awesome");
    expect(relationshipDescription.initializeOnCreate).toBe(true);
  });
});
