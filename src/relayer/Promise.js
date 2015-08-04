var thenFactory;

if(typeof Promise !== "undefined" && typeof Promise.then !== "undefined"){
  thenFactory = (resolver) => { return new Promise(resolver); };
}

export function setThenFactory(thenFac){
  thenFactory = thenFac;
}

export default class RelayerPromise {
  static resolve(value) {
    return new RelayerPromise((res, rej) => res(value));
  }

  static reject(value) {
    return new RelayerPromise((res, rej) => rej(value));
  };

  constructor(resolver) {
    //this.internalPromise = RelayerPromiseFactory.$q(resolver);
    this.internalPromise = thenFactory(resolver);
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
