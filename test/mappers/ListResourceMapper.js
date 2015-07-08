import ListResourceMapper from "../../src/relayer/mappers/ListResourceMapper.js"

describe("ListResourceMapper", function() {
  var listResourceFactory,
  manyResourceMapper,
  manyResourceMapperFactory,
  manyResourceMapSpy,
  data,
  uriTemplate,
  ListResource,
  ItemResourceClass,
  listResourceMapper,
  templatedUrlFromUrlFactory,
  templatedUrl,
  templatedUrlDataPathSpy,
  resourceBuilderFactory,
  primaryResourceBuilderFactory,
  results,
  transport,
  listResourceMapperFactory,
  listResourceSerializerFactory;

  beforeEach(function() {
    manyResourceMapper = {
      map() {
        return this.data.map((elem) => {
          return {
            response: elem
          };
        });
      }
    };

    manyResourceMapSpy = spyOn(manyResourceMapper, "map").and.callThrough();

    manyResourceMapperFactory = jasmine.createSpy("manyResourceMapperFactory ").and.callFake(
      function(thisTransport, thisData, ThisItemResourceClassourceClass) {
        manyResourceMapper.data = thisData;
        return manyResourceMapper;
      });

    data = new Array(10);
    data.fill({
      data: {
      },
      links: {

      }
    }, 0, 10);

    ListResource = function(thisData) {
      this.data = thisData;
      this.pathGet = function(path) {
        if (path == "$.data") {
          return this.data;
        } else if (path == "$.links.template") {
          return "/cheese/{cheese}";
        }
      };

      ["url", "uriTemplate", "uriParams", "remove", "update", "load"].forEach((func) => {
        this[func] = function() { return func; };
      });

      this.create = function(param) { return Promise.resolve(param); }

    };

    ItemResourceClass = function() {
      this.awesome = "awesome";
    };

    templatedUrl = {
      addDataPathLink(path) {
      }
    };

    templatedUrlDataPathSpy = spyOn(templatedUrl, "addDataPathLink").and.callThrough();

    templatedUrlFromUrlFactory = jasmine.createSpy("templatedUrlFromUrlFactory").and.returnValue(templatedUrl);

    resourceBuilderFactory = jasmine.createSpy("resourceBuilderFactory").and.callFake(function(transport, thisResponse, mapperFactory, serializerFactory, ThisResourceClass) {
      return {
        build() {
          var thisResource = new ThisResourceClass(thisResponse);
          return thisResource;
        }
      }
    });

    primaryResourceBuilderFactory = jasmine.createSpy("primaryResourceBuilderFactory").and.callFake(function(thisResponse, ThisResourceClass) {
      return {
        build() {
          var thisResource = new ThisResourceClass(thisResponse);
          return thisResource;
        }
      }
    });

    transport = {};

    listResourceMapperFactory = function() {
      return "hello";
    }

    listResourceSerializerFactory = function() {
      return "goodbye";
    }

    listResourceMapper = new ListResourceMapper(
      templatedUrlFromUrlFactory,
      resourceBuilderFactory,
      primaryResourceBuilderFactory,
      ListResource,
      manyResourceMapperFactory,
      transport,
      data,
      ItemResourceClass,
      listResourceMapperFactory,
      listResourceSerializerFactory);
  });

  describe("it should transform responses into a list", function() {
    beforeEach(function() {
      results = listResourceMapper.map();
    });

    it("should setup the many mapper with the ItemResourceClass", function() {
      expect(manyResourceMapperFactory).toHaveBeenCalledWith(transport, data, ItemResourceClass);
    });

    it("should build the list with the resource builder", function() {
      expect(manyResourceMapSpy).toHaveBeenCalled();
    });

    it("should return the right list", function() {
      var resultArray = data.map((elem) => {
        return {
          response: elem
        }
      });
      var resultElements = Array.from(results);
      expect(resultElements).toEqual(resultArray);
    });

    it("should setup pass through functions on the array", function() {
      ["url", "uriTemplate", "uriParams", "remove", "update", "load"].forEach((func) => {
        expect(results[func]()).toEqual(func);
      });
    });

    it("should setup new", function() {
      expect(results.new().awesome).toEqual("awesome");
    });

    it("should have the right properties", function() {
      expect(results.resource.data).toEqual(data);
    });

    it("should build the resource with the regular resource builder", function() {
      expect(resourceBuilderFactory).toHaveBeenCalledWith(
        transport,
        data,
        listResourceMapperFactory,
        listResourceSerializerFactory,
        ListResource);
    });

    describe("create", function() {
      var length;
      beforeEach(function(done) {
        length = results.length;
        results.create("something").then(() => done());
      });

      it("should add to the array", function() {
        expect(results.length).toEqual(length+1)
      });
    });
  });
});