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
  var resources, book, $httpBackend, $rootScope, mockHttp;

  beforeEach(function () {
    var injector = new Injector();
    injector.instantiate(AppModule);
    angular.mock.module('AppModule');
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
        } else if (params.method == "DELETE" && params.url == "http://www.example.com/books/1") {
          return Promise.resolve({
            status: 204,
            headers() {
              return {
                ETag: "4444"
              }
            },
            data: {
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

    describe("delete the book", function() {
      beforeEach(function(done) {
        book.remove().then(() => done());
      });

      it("should be finished", function() {
        expect(mockHttp).toHaveBeenCalledWith(jasmine.any(Function), jasmine.objectContaining({
          method: 'DELETE',
          url: "http://www.example.com/books/1"
        }))
      });
    });
  });
});
