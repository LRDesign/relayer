import RL from "../../src/relayer.js"
import {Module, Injector, Config} from "a1atscript";
import {TemplatedUrl} from "../../src/relayer/TemplatedUrl.js";

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
  var chapter = desc.hasOne("chapter", Chapter);
  chapter.initializeOnCreate = false;
  var book = desc.hasOne("book", Book);
  book.initializeOnCreate = true;
  var paragraphs = desc.hasList("paragraphs", Paragraph)
  paragraphs.initializeOnCreate = false;
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

class SectionGroups extends RL.Resource {
}

RL.Describe(SectionGroups, (desc) => {
  desc.property("total_groups", "");
  desc.property("sections_per_group", "");
  var book = desc.hasOne("book", Book);
  var first = desc.hasList("first", Section);
  first.ListResourceClass = SectionGroup;
})

class SectionGroup extends RL.ListResource {

}

RL.Describe(SectionGroup, (desc) => {
  var next = desc.hasList("next", Section);
  next.ListResourceClass = SectionGroup;
  var prev = desc.hasList("prev", Section);
  prev.ListResourceClass = SectionGroup;
})

class Book extends RL.Resource {
}

RL.Describe(Book, (desc) => {
  desc.property("title", "");
  desc.hasList("acts", Act, []);
  desc.hasList("sections", Section, []);
  desc.hasOne("sectionGroups", SectionGroups);

  //desc.hasOne("owner", User, {});
  var characters = desc.hasList("characters", Character, []);
  characters.canCreate = true;
});

class BookSigning extends RL.Resource {

}

RL.Describe(BookSigning, (desc) => {
  desc.property("date", "");
});

class Resources extends RL.Resource {
}

RL.Describe(Resources, (desc) => {
  var books = desc.hasList("books", Book, [])
  books.linkTemplate = "book";
  books.canCreate = true;
  var bookSigning = desc.hasOne("bookSigning", BookSigning)
  bookSigning.templated = true;
});

// this is horrible -- no easy way to get Babel and Traceur to compile the same config block
class AppConfig {
  @Config("relayerProvider")
  setupResources(relayerProvider) {
    relayerProvider.createApi("resources", Resources, "http://www.example.com/resources")
  }
}

var AppModule = new Module("AppModule", [RL, AppConfig.prototype]);

describe("initialization", function() {
  var section;
  beforeEach(function() {
    section = new Section();
  });

  it("should not initialize relationships when initializeOnCreate is false", function() {
    expect(section.relationships).toEqual({book: jasmine.any(Book)});
  });
});

describe("Loading relationships test", function() {
  var resources, book, act, chapter, chapters, section, paragraph, character, sectionGroup, $httpBackend, $rootScope;

  beforeEach(function () {
    var injector = new Injector();
    injector.instantiate(AppModule);
    angular.mock.module('AppModule');

    var mockHttp = function(Promise, params) {
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
              book: "/books/{id}",
              book_signing: "/book_signings/{id}"
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
              section_groups: "/books/1/section_groups",
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
      } else if (params.method == "GET" && params.url == "http://www.example.com/acts/2") {
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
      } else if (params.method == "PUT" && params.url == "http://www.example.com/acts/2/chapters") {
        return Promise.resolve({
          status: 200,
          headers() {
            return {
              ETag: "1449"
            }
          },
          data: {
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
              { links: { self: '/chapters/3', section: "/sections/7", act: "/acts/2" }},
              { links: { self: '/chapters/4', act: "/acts/2" }}
            ]
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
      } else if (params.url == "http://www.example.com/books/1/section_groups") {
        return Promise.resolve({
          status: 200,
          headers() {
            return {
              ETag: "999"
            }
          },
          data: {
            data: {
              sections_per_group: 2,
              total_groups: 5
            },
            links: {
              self: "/books/1/section_groups",
              book: "/book/1",
              template: "/sections/{id}",
              section: "/books/1/section_groups/{id}",
              first: "/books/1/section_groups/1"
            }
          }
        });
      } else if (params.url == "http://www.example.com/books/1/section_groups/1") {
        return Promise.resolve({
          status: 200,
          headers() {
            return {
              ETag: "9999"
            }
          },
          data: {
            links: {
              self: "/books/1/section_groups/1",
              book: "/book/1",
              template: "/sections/{id}",
              section: "/books/1/section_groups/{id}",
              next: "/books/1/section_groups/2",
              previous: ""
            },
            data: [{
              data: {
                title: "To Be Or Not To Be",
                kind: 'dramatic',
                resolution: 'positive',
              }
            },
            {
              data: {
                title: "That is the question",
                kind: 'dramatic',
                resolution: 'positive',
              }
            }]
          }
        });
      } else if (params.url == "http://www.example.com/books/1/section_groups/2") {
        return Promise.resolve({
          status: 200,
          headers() {
            return {
              ETag: "99999"
            }
          },
          data: {
            links: {
              self: "/books/1/section_groups/2",
              book: "/book/1",
              template: "/sections/{id}",
              section: "/books/1/section_groups/{id}",
              next: "/books/1/section_groups/3",
              previous: "/books/1/section_groups/1"
            },
            data: [{
              data: {
                title: "Hey man there's a beverage here",
                kind: 'dramatic',
                resolution: 'positive',
              }
            },
            {
              data: {
                title: "Well done",
                kind: 'dramatic',
                resolution: 'positive',
              }
            },
            ]
          }
        });
      } else if (params.url == "http://www.example.com/book_signings/2") {
        return Promise.resolve({
          status: 200,
          headers() {
            return {
              ETag: "77777"
            }
          },
          data: {
            links: {
            },
            data: {
              date: "a day"
            }
          }
        });
      }
    }
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

    describe("update", function() {
      beforeEach(function(done) {
        promise = book.acts({id: 2}).chapters().load().then((currentChapters) => {
          chapter = currentChapters.new();
          currentChapters.push(chapter);
          currentChapters.update().then((newChapters) => {
            chapters = newChapters;
            done();
          });
        });
      });

      it("should add the new chapter on update", function() {
        expect(chapters.length).toEqual(4);
      });

      it("should setup base classes properly", function() {
        expect(chapters[0]).toEqual(jasmine.any(Chapter));
      });
    });

    describe("section", function() {
      beforeEach(function(done) {
        promise = book.acts({id: 2}).chapters({id: 2}).section().load();
        promise.then((_section_) => {
          section = _section_;
          done();
        });
      });

      it("should verify relationships present and accessible", function() {
        expect(section.book().present()).toBe(true);
        expect(section.chapter().present()).toBe(true);
        expect(section.paragraphs().present()).toBe(true);
        expect(section.book().get()).toEqual(jasmine.any(TemplatedUrl));
        expect(section.paragraphs().get()[0]).toEqual(jasmine.any(Paragraph));
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

    describe("sectionGroups", function() {
      beforeEach(function(done) {
        promise = book.sectionGroups().first().load().then((_sectionGroup_) => {
          return _sectionGroup_.next().load();
        });
        promise.then((_sectionGroup_) => {
          sectionGroup = _sectionGroup_;
          done();
        });
      });

      it("should load the right section group", function() {
        expect(sectionGroup[0].title).toEqual("Hey man there's a beverage here")
      })
    })
  });

  describe("book signing", function() {
    var bookSigning;

    beforeEach(function(done) {
      resources.bookSigning({id: 2}).load().then((_bookSigning_) => {
        bookSigning = _bookSigning_;
        done();
      });
      $rootScope.$apply();
    });

    it("can load a single relationship from a template url", function() {
      expect(bookSigning.date).toEqual("a day");
    });
  });
});
