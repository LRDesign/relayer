import {TemplatedUrl, TemplatedUrlFromUrl} from "../src/relayer/TemplatedUrl.js"

describe("TemplatedUrl", function() {
  var templatedUrl;

  describe("normal case", function() {

    beforeEach(function() {
      templatedUrl = new TemplatedUrl("/cheese/{cheese}", {cheese: '4'});
    });

    describe("values", function() {
      it("should have the right uriTemplate", function() {
        expect(templatedUrl.uriTemplate).toEqual("/cheese/{cheese}");
      });

      it("should have the right uriParams", function() {
        expect(templatedUrl.uriParams).toEqual({cheese: '4'});
      });

      it("should have the right url", function() {
        expect(templatedUrl.url).toEqual("/cheese/4")
      })
    });

  });

  describe("from url", function() {

    beforeEach(function() {
      templatedUrl = new TemplatedUrlFromUrl("/cheese/{cheese}", "/cheese/4");
    });

    describe("values", function() {
      it("should have the right uriTemplate", function() {
        expect(templatedUrl.uriTemplate).toEqual("/cheese/{cheese}");
      });

      it("should have the right uriParams", function() {
        expect(templatedUrl.uriParams).toEqual({cheese: '4'});
      });

      it("should have the right url", function() {
        expect(templatedUrl.url).toEqual("/cheese/4")
      })
    });
  });

  describe("add data path link", function() {

    var mockResource, mockOtherResource;
    beforeEach(function() {
      mockResource = {
        links: {
          self: "/cheese/5"
        },

        pathGet(param) {
          if (param === "$.links.self") {
            return this.links.self;
          }
        },

        pathSet(param, value) {
          if (param === "$.links.self") {
            this.links.self = value
          }
        }
      }
      mockOtherResource = {
        links: {
          cheese: "/cheese/4"
        },

        pathGet(param) {
          if (param === "$.links.cheese") {
            return this.links.cheese;
          }
        },

        pathSet(param, value) {
          if (param === "$.links.cheese") {
            this.links.cheese = value
          }
        }
      }

      templatedUrl = new TemplatedUrl("/cheese/{cheese}", {cheese: '4'});
    });

    it("when I add a data path link it should update the URL", function() {
      templatedUrl.addDataPathLink(mockResource, "$.links.self");
      expect(templatedUrl.url).toEqual("/cheese/5");
      expect(templatedUrl.uriParams).toEqual({cheese: '5'});
    });

    it("when I add a data path link it should update previous data path links", function() {
      templatedUrl.addDataPathLink(mockOtherResource, "$.links.cheese")
      templatedUrl.addDataPathLink(mockResource, "$.links.self");
      expect(mockOtherResource.links.cheese).toEqual("/cheese/5")
    });
  });

});
