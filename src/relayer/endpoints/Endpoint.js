export default class Endpoint {
  constructor() {
  }

  create(resource, res, rej){
    return this.endpointPromise().then((endpoint) => {
      if (endpoint._create) {
        return endpoint._create(resource);
      } else {
        return endpoint.create(resource);
      }
    }).then(res, rej);
  }

  update(resource, res, rej){
    return this.endpointPromise().then((endpoint) => {
      if (endpoint._update) {
        return endpoint._update(resource);
      } else {
        return endpoint.update(resource)
      }
    }).then(res, rej);
  }

  load(res, rej){
    return this.endpointPromise().then((endpoint) => {
      if (endpoint._load) {
        return endpoint._load();
      } else {
        return endpoint.load();
      }
    }).then(res, rej);
  }

  get(prop, ...args) {
    return this.load().then((response) => {
      if (typeof response[prop] == 'function') {
        return response[prop](...args);
      } else {
        return response[prop];
      }
    });
  }

  remove(res, rej){
    return this.endpointPromise().then((endpoint) => {
      return endpoint._remove();
    }).then(res, rej);
  }
}
