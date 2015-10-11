export default function wrapThenable(buildThenable) {
  class RelayerPromise {
    constructor(wrappedPromise) {
      //this.internalPromise = RelayerPromiseFactory.$q(resolver);
      this.internalPromise = wrappedPromise;
    }

    then(onFulfilled, onRejected, progressBack) {
      return new RelayerPromise(this.internalPromise.then(onFulfilled, onRejected, progressBack));
    }

    catch(callback) {
      return new RelayerPromise(this.internalPromise.catch(callback));
    }

    finally(callback, progressBack) {
      return new RelayerPromise(this.internalPromise.finally(callback, progressBack));
    }
  }

  function PromiseApi(resolver) {
    return new RelayerPromise(buildThenable(resolver));
  }

  PromiseApi.resolve = function(value) {
    return new RelayerPromise(buildThenable((res, rej) => res(value)));
  };

  PromiseApi.reject = function(value) {
    return new RelayerPromise(buildThenable((res, rej) => rej(value)));
  };

  return PromiseApi;
}
