import RL from "../../src/relayer.js"
import {Module, Injector, Config} from "a1atscript";

class Chapter extends RL.Resource {
}

RL.Describe(Chapter, (desc) => {
  desc.hasOne("section", Section);
  desc.hasOne("act", Act);
});

class Act extends RL.Resource {
}

RL.Describe(Act, (desc) => {
  desc.hasOne("book", Book, {});
  desc.hasList("chapters", Chapter, []);
});

class Section extends RL.Resource {
}

RL.Describe(Section, (desc) => {
  desc.property("title", "");
  desc.property("kind", "");
  desc.property("resolution", "")
  desc.hasOne("chapter", Chapter);
  desc.hasOne("book", Book);
  desc.hasList("paragraphs", Paragraph)
});

class Paragraph extends RL.Resource {

}

RL.Describe(Paragraph, (desc) => {
  desc.property("kind", "");
  desc.property("body", "");
  desc.hasOne("book", Book)
  desc.hasOne("section", Section);
  desc.hasList("characters", Character);
});

class Character extends RL.Resource {

}

RL.Describe(Character, (desc) => {
  desc.property("name", "")
  desc.hasOne("book", Book);
});

class Book extends RL.Resource {
}

RL.Describe(Book, (desc) => {
  desc.property("title", "");
  desc.hasList("acts", Act, []);
  desc.hasList("sections", Section, []);
  //desc.hasOne("owner", User, {});
  var characters = desc.hasList("characters", Character, []);
  characters.canCreate = true;
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

describe("Yoric test", function() {
  var resources, book, act, chapter, section, paragraph, character, $httpBackend;

  beforeEach(function () {
    var injector = new Injector();
    injector.instantiate(AppModule);
    angular.mock.module('AppModule');

    var mockHttp = function(params) {
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
      } else if (params.url == "http://www.example.com/books/1") {
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
              acts: "/books/1/acts",
              sections: "/books/1/sections",
              owner: "/users/2"
            },
            data: {
              title: "Hamlet",

              acts: {
                links: {
                  self: "/books/1/acts",
                  book: "/books/1",
                  template: "/acts/{id}"
                },
                data: [
                  { links: { self: '/acts/1' }},
                  { links: { self: '/acts/2' }},
                  { links: { self: '/acts/3' }}
                ]
              }
            }
          }
        });
      } else if (params.url == "http://www.example.com/acts/2") {
        return Promise.resolve({
          status: 200,
          headers() {
            return {
              ETag: "1448"
            }
          },
          data: {
            links: {
              self:    "/acts/2",
              book: "/books/1"
            },
            data: {
              // Chapters is LinkedResourceList object
              chapters: {
                links: {
                  self: "/acts/2/chapters",  // see ActChapters
                  act:  "/acts/2",
                  template: "/chapters/{id}" // template for a single chapter url
                },

                // The data themselves are Chapter objects that only contain links.
                // A chapter is really just a link to its first section.
                data: [
                  { links: { self: '/chapters/1', section: "/sections/1", act: "/acts/2" }},
                  { links: { self: '/chapters/2', section: "/sections/4", act: "/acts/2" }},
                  { links: { self: '/chapters/3', section: "/sections/7", act: "/acts/2" }}
                ]
              }
            }
          }
        });
      } else if (params.url == "http://www.example.com/sections/4") {
        return Promise.resolve({
          status: 200,
          headers() {
            return {
              ETag: "148"
            }
          },
          data: {
            links: {
              self:    '/sections/4',
              chapter:   '/chapters/1',
              book: '/books/1',
            },
            data: {
              title: "To Be Or Not To Be",
              kind: 'dramatic',
              resolution: 'positive',
              paragraphs: {
                links: {
                  self: '/sections/4/paragraphs',
                  section: '/sections/4',
                  book: '/books/1',
                  template: '/paragraphs/{id}' // template for a single paragraph url
                },

                data: [

                  // First Paragraph of the Section
                  {
                    links: {
                      self:       "/paragraphs/1",
                      characters: "/paragraphs/1/characters",
                      section:       "/sections/4"
                    },
                    data: {
                      kind:  'dialog',
                      body:  "To Be Or Not To Be",
                      characters: {
                        links: {
                          self: '/paragraphs/1/characters',
                          template: "/characters/{id}", // template for a single character url
                          paragraph: "/paragraphs/1"
                        },
                        data: [
                          {
                            // characters link to the book they are defined for, as well as self.
                            links: { self: "/characters/1", book: "/books/1" },
                            data:  { name: "Hamlet"  }
                          }
                        ]
                      }
                    }
                  },
                  // Second Paragraph of the Section
                  {
                    links: {
                      self:       "/paragraphs/3",
                      characters: "/paragraphs/3/characters",
                      section:       "/sections/4"
                    },
                    data: {
                      kind:  'dialog',
                      body:  "Whether Tis Nobler To Do Something Or Something else blah blah blah",
                      characters: {
                        links: {
                          self: '/paragraphs/3/characters',
                          template: "/characters/{id}", // template for a single character url
                          paragraph: "/paragraphs/3"
                        },
                        data: [
                          {
                            // characters link to the book they are defined for, as well as self.
                            links: { self: "/characters/1", book: "/books/1" },
                            data:  { name: "Hamlet"  }
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            }
          }
        });
      }
    }
    angular.mock.module(function($provide) {
      $provide.value("$http", mockHttp);
    });
    inject(function($injector, _resources_) {
      resources = _resources_;
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
    });

    it("should resolve the book", function() {
      expect(book.title).toEqual("Hamlet");
    });

    describe("section", function() {
      beforeEach(function(done) {
        promise = book.acts({id: 2}).chapters({id: 2}).section().load();
        promise.then((_section_) => {
          section = _section_;
          done();
        });
      });

      it("should resolve the section", function() {
        expect(section.title).toEqual("To Be Or Not To Be");
        expect(section.kind).toEqual('dramatic');
        expect(section.resolution).toEqual('positive');
      });

      describe("character", function() {
        beforeEach(function(done) {
          promise = section.paragraphs({id: 3}).characters({id: 1}).load();
          promise.then((_character_) => {
            character = _character_;
            done();
          });
        });

        it("should resolve the section", function() {
          expect(character.name).toEqual("Hamlet")
        });
      });
    });
  });
});
