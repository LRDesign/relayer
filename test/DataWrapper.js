import DataWrapper from "../src/relayer/DataWrapper.js"

describe("DataWrapper", function() {
  var testData, dataWrapper;

  beforeEach(function() {
    testData = {
      awesome: {
        nested: {
          value1: "tree",
          value2: false,
          value3: "silly",
          arrayValue: [1,2,3]
        }
      }
    };

    dataWrapper = new DataWrapper();
    dataWrapper._response = testData;
  });

  describe("pathBuild", function() {
    it("should build a path where there isn't one", function() {
      dataWrapper.pathBuild("$.data.happy.town", "is happy!");
      expect(testData["data"]["happy"]["town"]).toEqual("is happy!");
    });

    it("should set a value on an existing path", function() {
      dataWrapper.pathBuild("$.awesome.nested.value1", "branch");
      expect(testData["awesome"]["nested"]["value1"]).toEqual("branch")
      expect(testData["awesome"]["nested"]["value3"]).toEqual("silly")
    })
  });

  describe("pathGet", function() {

    it("should get a simple value", function() {
      expect(dataWrapper.pathGet("$.awesome.nested.value1")).toEqual("tree");
    });

    it("should get a boolean false value", function() {
      expect(dataWrapper.pathGet("$.awesome.nested.value2")).toEqual(false);
    });

    it("should get an array value", function() {
      expect(dataWrapper.pathGet("$.awesome.nested.arrayValue")).toEqual([1,2,3]);
    });

    // should we instead raise an exception?

    it("should return undefined when value is not defined", function() {
      expect(dataWrapper.pathGet("$.awesome.nested.nonExistentValue")).toEqual(undefined);
    });
  });

  describe("pathSet", function() {
    it("should set a simple value on an existing path", function() {
      dataWrapper.pathSet("$.awesome.nested.value1", "old tree");
      expect(testData["awesome"]["nested"]["value1"]).toEqual("old tree");
    });

    it("should have no effect when setting a value on an nonexistent path", function() {
      dataWrapper.pathSet("$.awesome.nonexistent.something", "new value");
      expect(testData["awesome"]).toEqual({
        nested: {
          value1: "tree",
          value2: false,
          value3: "silly",
          arrayValue: [1,2,3]
        }
      });
    });

    it("should set an value on an existing path", function() {
      dataWrapper.pathSet("$.awesome.nested.arrayValue", [4,5,6]);
      expect(testData["awesome"]["nested"]["arrayValue"]).toEqual([4,5,6]);
    });
  });

  describe("pathClear", function() {
    it("should set a simple value on an existing path", function() {
      dataWrapper.pathClear("$.awesome.nested.value1");
      expect(testData["awesome"]["nested"]["value1"]).toEqual(undefined);
    });

    it("should have no effect when setting a value on an nonexistent path", function() {
      dataWrapper.pathClear("$.awesome.nonexistent.something");
      expect(testData["awesome"]).toEqual({
        nested: {
          value1: "tree",
          value2: false,
          value3: "silly",
          arrayValue: [1,2,3]
        }
      });
    });

    it("should set an value on an existing path", function() {
      dataWrapper.pathClear("$.awesome.nested.arrayValue");
      expect(testData["awesome"]["nested"]["arrayValue"]).toEqual(undefined);
    });
  });
});
