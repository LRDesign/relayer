import {SimpleFactory} from "./SimpleFactoryInjector.js";

export class TemplatedUrl {

  constructor(uriTemplate, uriParams = {}) {
    this._uriTemplate = new UriTemplate(uriTemplate);
    this._uriParams = uriParams;
    this._paths = [];
  }

  get uriTemplate() {
    return this._uriTemplate.toString();
  }

  get uriParams() {
    return this._uriParams;
  }

  get url() {
    return this._uriTemplate.fillFromObject(this._uriParams);
  }

  _setUrl(url) {
    var uriParams = this._uriTemplate.fromUri(url);
    this._uriParams = uriParams;
  }

  addDataPathLink(resource, path) {
    var newUrl = resource.pathGet(path);
    if (newUrl) {
      this._setUrl(newUrl);
      this._paths.forEach((path) => {
        path.resource.pathSet(path.path, newUrl);
      });
      this._paths.push({
        resource: resource,
        path: path
      });
    }
  }
}

export class TemplatedUrlFromUrl extends TemplatedUrl {

  constructor(uriTemplate, url) {
    super(uriTemplate);
    super._setUrl(url)
  }

}
