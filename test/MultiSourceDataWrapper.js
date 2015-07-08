/*import MultiSourceDataWrapper from "resourceLayer/MultiSourceDataWrapper.js"

describe("MultiSourceDataWrapper", function() {
  var dataSource1, dataSource2, url1, url2, multiSourceDataWrapper, dataWrapped1, dataWrapped2;

  beforeEach(function() {
    dataSource1 = {
      awesome: 'cheese',
      face: 1
    }

    dataSource2 = {
      awesome: 'bread'
    }

    url1 = {
      property: "doesn't matter"
    }

    url2 = {
      property2: "doesn't matter"
    }

    multiSourceDataWrapper = new MultiSourceDataWrapper();

    dataWrapped1 = multiSourceDataWrapper.addSource(url1, dataSource1);
    dataWrapped2 = multiSourceDataWrapper.addSource(url2, dataSource2);
  });

  it("should overwrite properties each time a new datasource is added", function() {
    expect(dataSource1.awesome).toEqual('bread');
    expect(dataWrapped1.pathGet("$.awesome")).toEqual('bread');
  });

  it("writing to a wrapped data should update all data sources", function() {
    dataWrapped1.pathSet("$.awesome", "cookies");
    expect(dataSource1.awesome).toEqual("cookies");
    expect(dataSource2.awesome).toEqual("cookies");
    expect(dataWrapped2.pathGet("$.awesome")).toEqual("cookies");
  });

  it("should not get properties of other data sources that are not in the original properties of that source", function() {
    expect(dataSource2.face).toEqual(undefined);
    expect(dataWrapped2.pathGet("$.face")).toEqual(undefined);
  });

  it("should not set properties on other data sources that are not in the original properties of that source", function() {
    dataWrapped1.pathSet("$.face", 2);
    expect(dataSource1.face).toEqual(2);
    expect(dataSource2.face).toEqual(undefined);
    expect(dataWrapped2.pathGet("$.face")).toEqual(undefined);
  });

  it("if path is built, it should be built only on the given source but set on all sources", function() {
    dataWrapped2.pathBuild("$.face", 3);
    expect(dataWrapped2.pathGet("$.face")).toEqual(3);
    expect(dataWrapped1.pathGet("$.face")).toEqual(3);
    dataWrapped2.pathBuild("$.newProp", "is new!");
    expect(dataWrapped2.pathGet("$.newProp")).toEqual("is new!");
    expect(dataWrapped1.pathGet("$.newProp")).toEqual(undefined);
  });

  it("if path is cleared, it is only cleared on the given data source", function() {
    dataWrapped1.pathClear("$.awesome");
    expect(dataWrapped1.pathGet("$.awesome")).toEqual(undefined);
    expect(dataWrapped2.pathGet("$.awesome")).toEqual("bread");
  });

  describe("using same source key", function() {
    var dataWrapped3, dataSource3;
    beforeEach(function() {
      dataSource3 = {
        awesome: "face",
        silly: "cool"
      };
      dataWrapped3 = multiSourceDataWrapper.addSource(url1, dataSource3);
    })
    it("replaces the existing source at the given source key", function() {
      expect(dataWrapped3.pathGet("$.silly")).toEqual("cool");
      expect(dataWrapped1.pathGet("$.silly")).toEqual("cool");
    });

    it('returns the same wrapped data', function() {
      expect(dataWrapped3).toBe(dataWrapped1);
    })
  });

});*/
