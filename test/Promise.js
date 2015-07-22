import RelayerPromiseFactory from "../src/relayer/Promise.js";

describe("Relayer Promise", function() {
  var relayerPromise, RelayerPromise, promiseImplementation, finalResults;
  beforeEach(function() {
    promiseImplementation = function(...params) {
      return new Promise(...params);
    };

    RelayerPromise = RelayerPromiseFactory.factory(promiseImplementation);
  });

  describe("constructor style", function() {
    describe("resolve", function() {
      beforeEach(function(done) {
        relayerPromise = new RelayerPromise((res, rej) => res("Hello"));
        relayerPromise.then((results) => {
          finalResults = results;
          done();
        });
      });

      it("should resolve", function() {
        expect(finalResults).toEqual("Hello");
      });
    });

    describe("reject", function() {
      beforeEach(function(done) {
        relayerPromise = new RelayerPromise((res, rej) => rej("Fail"));
        relayerPromise.catch((results) => {
          finalResults = results;
          done();
        });
      });

      it("should resolve", function() {
        expect(finalResults).toEqual("Fail");
      });
    });

  });

  describe("resolve", function() {
    beforeEach(function(done) {
      relayerPromise = RelayerPromise.resolve("Hello");
      relayerPromise.then((results) => {
        finalResults = results;
        done();
      });
    });

    it("should resolve", function() {
      expect(finalResults).toEqual("Hello");
    });
  });

  describe("reject", function() {
    beforeEach(function(done) {
      relayerPromise = RelayerPromise.reject("Fail");
      relayerPromise.catch((results) => {
        finalResults = results;
        done();
      });
    });

    it("should resolve", function() {
      expect(finalResults).toEqual("Fail");
    });
  });
});
