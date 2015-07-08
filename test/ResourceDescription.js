/*import ResourceDescription from "resourceLayer/ResourceDescription.js"
import ResourceTransform from "resourceLayer/ResourceTransform.js"

class SimpleAttributeTransform extends ResourceTransform {
  static get transformArguments() {
    return ["attribute", "value"];
  }

  transform(attribute, value) {
    this.ResourceClass.prototype[attribute] = value;
  }
}

class TestClass {
  constructor() {

  }
}

xdescribe("ResourceDescription", function() {
  var resourceDescription;
  beforeEach(function() {
    ResourceDescription.registerTransform("simple", SimpleAttributeTransform);
    resourceDescription = new ResourceDescription(TestClass);
  });

  it("should setup functions", function() {
    expect(typeof resourceDescription.simple).toEqual('function')
  });

  it("the functions should be chainable, and modify the resource class", function() {
    var newResourceDescription = resourceDescription.simple("testAttr", "testValue");
    newResourceDescription.simple("testAttr2", "testValue2")
    var testClassInstance = new TestClass();
    expect(newResourceDescription instanceof ResourceDescription).toEqual(true);
    expect(testClassInstance.testAttr).toEqual('testValue');
    expect(testClassInstance.testAttr2).toEqual('testValue2');
  });

  it("should setup the resourceDescription on the test class", function() {
    var newResourceDescription = resourceDescription.simple("testAttr", "testValue");
    newResourceDescription.simple("testAttr2", "testValue2")
    expect(TestClass.resourceDescription.simpleTransforms).toEqual([{
      attribute: "testAttr",
    value: "testValue",
    },
    {
      attribute: "testAttr2",
      value: "testValue2"
    }])
  });
});
*/
