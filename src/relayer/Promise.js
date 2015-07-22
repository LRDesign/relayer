import {Factory} from "a1atscript";

class RelayerPromise {

  static resolve(value) {
    return new RelayerPromise((res, rej) => res(value));
  }

  static reject(value) {
    return new RelayerPromise((res, rej) => rej(value));
  };

  constructor(resolver) {
    this.internalPromise = RelayerPromiseFactory.$q(resolver);
  }

  then(onFulfilled, onRejected, progressBack) {
    return this.internalPromise.then(onFulfilled, onRejected, progressBack);
  }

  catch(callback) {
    return this.internalPromise.catch(callback);
  }

  finally(callback, progressBack) {
    return this.internalPromise.finally(callback, progressBack);
  }
}

export default class RelayerPromiseFactory {

  @Factory('RelayerPromise', ['$q'])
  static factory($q) {
    RelayerPromiseFactory.$q = $q;
    return RelayerPromise;
  }

}
