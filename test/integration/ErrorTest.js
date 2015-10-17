import RL from "../../src/relayer.js"
import {Module, Injector, Config} from "a1atscript";
import {TemplatedUrl} from "../../src/relayer/TemplatedUrl.js";

class Book extends RL.Resource {
}

RL.Describe(Book, (desc) => {
  desc.property("title", "");
});

class Resources extends RL.Resource {
}

RL.Describe(Resources, (desc) => {
  var books = desc.hasList("books", Book, [])
  books.linkTemplate = "book";
  books.canCreate = true;
});

// this is horrible -- no easy way to get Babel and Traceur to compile the same config block
class AppConfig {
  @Config("relayerProvider")
  setupResources(relayerProvider) {
    relayerProvider.createApi("resources", Resources, "http://www.example.com/resources")
  }
}

var AppModule = new Module("AppModule", [RL, AppConfig.prototype]);

describe("Delete test", function() {
  var resources, book, failedBook, $httpBackend, $rootScope, mockHttp;

  beforeEach(function () {
    var injector = new Injector();
    injector.instantiate(AppModule);
    angular.mock.module('AppModule');

    // the 422 throws an exception, so we need to prevent this from
    // failing the test
    angular.mock.module(function($exceptionHandlerProvider) {
      $exceptionHandlerProvider.mode('log');
    });
    mockHttp = jasmine.createSpy('mockHttp').and.callFake(
      function(Promise, params) {
        if (params.url == "http://www.example.com/resources") {
          return Promise.resolve({
            status: 200,
            headers() {
              return {
                ETag: "1348"
              }
            },
            data: {
              data: {},
              links: {
                books: "/books",
                book: "/books/{id}"
              }
            }
          });
        } else if (params.method == "GET" && params.url == "http://www.example.com/books/1") {
          return Promise.resolve({
            status: 200,
            headers() {
              return {
                ETag: "1567"
              }
            },
            data: {
              links: {
                self: "/books/1",
              },
              data: {
                title: "Hamlet",
              }
            }
          });
        } else if (params.method == "PUT" && params.url == "http://www.example.com/books/1") {
          return Promise.reject({
            status: 422,
            headers() {
              return {
                ETag: "4444"
              }
            },
            data: {
              "data": {
                "title": {
                  "type": "name.taken",
                  "message": "has already been taken"
                }
              }
            }
          });
        }
      });
    angular.mock.module(function($provide) {
      $provide.factory("$http", function(XingPromise) {
        return function(params) {
          return mockHttp(XingPromise, params);
        };
      });
    });
    inject(function($injector, _resources_, _$rootScope_) {
      resources = _resources_;
      $rootScope = _$rootScope_;
    });
  });

  describe("book", function() {
    var promise;

    beforeEach(function(done) {
      promise = resources.books({id: 1}).load();
      promise.then((_book_) => {
        book = _book_;
        done();
      });
      $rootScope.$apply();
    });

    it("should resolve the book", function() {
      expect(book.title).toEqual("Hamlet");
    });

    describe("updating the book fails", function() {
      beforeEach(function(done) {
        book.update().catch((_failedBook_) => {
          failedBook = _failedBook_;
          done();
        });
      });

      it("should fail", function() {
        expect(failedBook.handleMessage("title")).toEqual("has already been taken");
      });
    });
  });
});
