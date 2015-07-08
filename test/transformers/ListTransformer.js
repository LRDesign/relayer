/*import ListTransformer from "resourceLayer/transformers/ListTransformer.js"

describe("ListTransformer", function() {
  var listResourceBuilderFactory,
  listResourceBuilder,
  listResourceBuildSpy,
  data,
  uriTemplate,
  resource,
  list,
  response,
  ItemResourceClass,
  mockEndpoint,
  results,
  requestResults,
  listTransformer;

  beforeEach(function() {
    listResourceBuilder = {
      build(list, templatedUrl) {
        return list.map((elem) => {
          return {
            response: elem
          };
        });
      }
    };

    listResourceBuildSpy = spyOn(listResourceBuilder, "build").and.callThrough();

    listResourceBuilderFactory = jasmine.createSpy("listResourceBuilderFactory").and.returnValue(listResourceBuilder);

    data = new Array(10);
    data.fill({
      data: {
      },
      links: {

      }
    }, 0, 10);

    resource = {
      data: data,
      pathGet(path) {
        if (path == "$.data") {
          return this.data;
        } else if (path == "$.links.template") {
          return "/cheese/{cheese}";
        }
      },
      pathSet(path, value) {
        if (path == "$.data") {
          this.data = value;
          return this.data;
        }
      }
    };

    ["url", "uriTemplate", "uriParams", "create", "remove", "update", "load"].forEach((func) => {
      resource[func] = function() { return func; };
    });

    response = Promise.resolve(resource);

    ItemResourceClass = function() {
      return "awesome";
    };

    mockEndpoint = {}

    listTransformer = new ListTransformer(listResourceBuilderFactory, ItemResourceClass);
  });

  describe("it should transform responses into a list", function() {
    beforeEach(function(done) {
      results = listTransformer.transformResponse(mockEndpoint, response);
      results.then((finalList) => {
        results = finalList;
        done();
      });
    });

    it("should setup the builder with the ItemResourceClass", function() {
      expect(listResourceBuilderFactory).toHaveBeenCalledWith(ItemResourceClass);
    });

    it("should build the list with the resource builder", function() {
      expect(listResourceBuildSpy).toHaveBeenCalledWith(data, "/cheese/{cheese}");
    });

    it("should return the right list", function() {
      var resultArray = data.map((elem) => {
        return {
          response: elem
        }
      });
      expect(results).toEqual(resultArray);
    });

    it("should setup pass through functions on the array", function() {
      ["url", "uriTemplate", "uriParams", "create", "remove", "update", "load"].forEach((func) => {
        expect(results[func]()).toEqual(func);
      });
    });

    describe("it should transform requests back to the resource", function() {
      beforeEach(function() {
        results.pop();
        results.push({
          response: "SillyTown"
        });
        results.push({
          response: "awesomeness"
        });
        requestResults = listTransformer.transformRequest(mockEndpoint, results);
      });

      it("returns the resource from the list, accepting changes in list", function() {
        var resultArray = new Array(9);
        resultArray.fill({
          data: {
          },
          links: {

          }
        }, 0, 9);
        resultArray.push("SillyTown");
        resultArray.push("awesomeness");
        expect(requestResults.pathGet("$.data")).toEqual(resultArray);
      });
    });
  });


});*/
