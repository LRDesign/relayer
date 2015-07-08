import Transport from "../src/relayer/Transport.js";

describe("Transport", function() {
  var mockHttp, mockUrlHelper, transport, response, etag, httpSpy, httpSecondCallSpy;

  beforeEach(function() {
    httpSpy = jasmine.createSpy("http");
    mockUrlHelper = {
      fullUrl(url) {
        if (url == "http://yahoo.com/awesomeTown/1") {
          return url;
        } else {
          return `http://www.yahoo.com${url}`;
        }
      },
      checkLocationUrl(respUrl, reqUrl) {
        return "http://yahoo.com/awesomeTown/1";
      }
    }
    transport = new Transport(mockUrlHelper, httpSpy);
  });

  describe("get", function() {
    describe("success", function() {
      beforeEach(function(done) {
         httpSpy.and.callFake(() => new Promise((resolve) => resolve({
            status: 200,
            headers() {
              return {
                'ETag': "Cheese"
              }
            },
            data: {
              thing_test: "isAwesome"
            }
        })));
        transport.get("/awesomeTown", "Awesome").then((returnedResponse) => {
          response = returnedResponse.data;
          etag = returnedResponse.etag;
          done();
        })
      });

      it("should call $http.get with the right parameters", function() {
        expect(httpSpy).toHaveBeenCalledWith({
          method: "GET",
          headers: {
            "If-None-Match": "Awesome"
          },
          url: "http://www.yahoo.com/awesomeTown"
        });
      });

      it("should get the right response back", function() {
        expect(response).toEqual({
          thing_test: "isAwesome"
        });
      });

      it("should read the etag", function() {
        expect(etag).toEqual("Cheese");
      });
    });

    describe("error", function() {
      beforeEach(function(done) {
        httpSpy.and.callFake(() => new Promise((resolve, reject) => reject({
            status: 401,
            data: {
              you_are: "unauthorized"
            }
        })));
        transport.get("/awesomeTown", "Awesome").catch((returnedResponse) => {
          response = returnedResponse.data;
          done();
        });
      });

      it("should call $http.get with the right parameters", function() {
        expect(httpSpy).toHaveBeenCalledWith({
          method: "GET",
          headers: {
            'If-None-Match': "Awesome"
          },
          url: "http://www.yahoo.com/awesomeTown"
        });
      });

      it("should throw the right error data", function() {
        expect(response).toEqual({
          you_are: "unauthorized"
        });
      });
    });
  });

  describe("post", function() {
    describe("success", function() {
      beforeEach(function(done) {
        httpSpy.and.callFake(
          (params) => {
            if (params.method == "POST") {
              return new Promise((resolve) => resolve({
                status: 201,
                headers() {
                  return {
                    location: "/awesomeTown/1"
                  };
                },
                config: {
                  url: "http://yahoo.com/awesomeTown"
                }
              }));
            } else if (params.method == "GET") {
              return new Promise((resolve) => resolve({
                status: 200,
                headers() {
                  return {};
                },
                data: {
                  cheese: "gouda"
                }
              }));
            }
          }
        );
        transport.post("/awesomeTown", { cheese: "gouda" }).then((returnedResponse) => {
          response = returnedResponse.data;
          done();
        });
      });

      it("should call $http.post with the right parameters", function() {
        expect(httpSpy).toHaveBeenCalledWith({
          method: "POST",
          url: "http://www.yahoo.com/awesomeTown",
          data: {
            cheese: "gouda"
          }
        });
      });

      it("should pass the returned location to $http.get", function() {
        expect(httpSpy).toHaveBeenCalledWith({
          method: "GET",
          url: "http://yahoo.com/awesomeTown/1"
        });
      });

      it("should get the right response back", function() {
        expect(response).toEqual({
          cheese: "gouda"
        });
      });
    });

    describe("error", function() {
      beforeEach(function(done) {
        httpSpy.and.callFake(() => new Promise((resolve, reject) => reject({
            status: 422,
            data: {
              cheese: "can't be swiss"
            }
        })));
        transport.post("/awesomeTown", { cheese: "swiss"}).catch((returnedResponse) => {
          response = returnedResponse.data;
          done();
        });
      });

      it("should call $http.post with the right parameters", function() {
        expect(httpSpy).toHaveBeenCalledWith({
          method: "POST",
          url: "http://www.yahoo.com/awesomeTown",
          data: {
            cheese: "swiss"
          }
        });
      });

      it("should throw the right error data", function() {
        expect(response).toEqual({
          cheese: "can't be swiss"
        });
      });
    });
  });

  describe("put", function() {
    describe("success", function() {
      beforeEach(function(done) {
        httpSpy.and.callFake(() => new Promise((resolve) => resolve({
            status: 200,
            headers() {
              return {
                'ETag': "NewCheese"
              }
            },
            data: {
              cheese: "gouda"
            }
        })));
        transport.put("/awesomeTown/1", { cheese: "gouda" }, "Cheese").then((returnedResponse) => {
          response = returnedResponse.data;
          etag = returnedResponse.etag;
          done();
        })
      });

      it("should call $http.put with the right parameters", function() {
        expect(httpSpy).toHaveBeenCalledWith({
          method: "PUT",
          headers: {
            "If-Match": "Cheese"
          },
          url: "http://www.yahoo.com/awesomeTown/1",
          data: {
            cheese: "gouda"
          }
        });
      });

      it("should get the right response back", function() {
        expect(response).toEqual({
          cheese: "gouda"
        });
      });

      it("should set the etag", function() {
        expect(etag).toEqual("NewCheese");
      });
    });

    describe("error", function() {
      beforeEach(function(done) {
        httpSpy.and.callFake(() => new Promise((resolve, reject) => reject({
            status: 422,
            data: {
              cheese: "can't be swiss"
            }
        })));
        transport.put("/awesomeTown/1", { cheese: "swiss"}, "Cheese").catch((returnedResponse) => {
          response = returnedResponse.data;
          done();
        });
      });

      it("should call $http.put with the right parameters", function() {
        expect(httpSpy).toHaveBeenCalledWith({
          method: "PUT",
          url: "http://www.yahoo.com/awesomeTown/1",
          headers: {
            "If-Match": "Cheese"
          },
          data: {
            cheese: "swiss"
          }
        });
      });

      it("should throw the right error data", function() {
        expect(response).toEqual({
          cheese: "can't be swiss"
        });
      });
    });
  });


  describe("delete", function() {
    describe("success", function() {
      beforeEach(function(done) {
        httpSpy.and.callFake(() => new Promise((resolve) => resolve({
            status: 204,
            headers() {
              return {};
            },
            data: {}
        })));
        transport.delete("/awesomeTown/1").then((returnedResponse) => {
          response = returnedResponse.data;
          done();
        });
      });

      it("should call $http.delete with the right parameters", function() {
        expect(httpSpy).toHaveBeenCalledWith({
          method: "DELETE",
          url: "http://www.yahoo.com/awesomeTown/1"
        });
      });

      it("should get the right response back", function() {
        expect(response).toEqual({});
      });
    });

    describe("error", function() {
      beforeEach(function(done) {
        httpSpy.and.callFake(() => new Promise((resolve, reject) => reject({
            status: 401,
            data: {
              you_are: "unauthorized"
            }
        })));
        transport.delete("/awesomeTown/1").catch((returnedResponse) => {
          response = returnedResponse.data;
          done();
        });
      });

      it("should call $http.get with the right parameters", function() {
        expect(httpSpy).toHaveBeenCalledWith({
          method: "DELETE",
          url: "http://www.yahoo.com/awesomeTown/1"
        });
      });

      it("should throw the right error data", function() {
        expect(response).toEqual({
          you_are: "unauthorized"
        });
      });
    });
  });
});
