import UrlHelper from "../src/relayer/UrlHelper.js";

describe("UrlHelper", function() {
  var urlHelper;

  describe("initialization", function() {
    it("removes trailing slashes from the given base url", function() {
      urlHelper = new UrlHelper("http://www.yahoo.com/");
      expect(urlHelper.baseUrl).toEqual("http://www.yahoo.com");
      urlHelper = new UrlHelper("http://www.yahoo.com");
      expect(urlHelper.baseUrl).toEqual("http://www.yahoo.com");
      urlHelper = new UrlHelper("http://www.yahoo.com/bob");
      expect(urlHelper.baseUrl).toEqual("http://www.yahoo.com");
    });
  });

  describe("methods", function() {
    beforeEach(function() {
      urlHelper = new UrlHelper("http://www.yahoo.com");
    });

    describe("fullUrl", function() {
      it("does nothing to a url that is already full", function() {
        expect(urlHelper.fullUrl("http://google.com/awesome")).toEqual("http://google.com/awesome");
      });

      it("adds relative urls to the base url properly, even if relative urls have initial slash", function() {
        expect(urlHelper.fullUrl("/awesome")).toEqual("http://www.yahoo.com/awesome");
        expect(urlHelper.fullUrl("awesome")).toEqual("http://www.yahoo.com/awesome");
      });
    });

    describe("checkLocationUrl", function() {
      it("does nothing to a url that is already full", function() {
        expect(urlHelper.checkLocationUrl("http://google.com/awesome", "http://www.yahoo.com/cheese")).toEqual("http://google.com/awesome");
      });

      it("extracts the domain from the request url if the response url is relative", function() {
        expect(urlHelper.checkLocationUrl("/awesome", "http://www.google.com/cheese")).toEqual("http://www.google.com/awesome");
      });
    });
  });
});
