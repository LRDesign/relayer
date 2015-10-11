export default class UrlHelper {
  constructor(baseUrl) {
    this.rawUrl = baseUrl;
    if (this.isFullUrl(baseUrl)) {
      baseUrl = this.fullUrlRegEx.exec(baseUrl)[1];
    }
    this.baseUrl = this.withoutTrailingSlash(baseUrl);
  }

  get wellKnownUrl() {
    return this.fullUrlRegEx.exec(this.rawUrl)[3];
  }

  mangleUrl(url){
    if(url){ return url.replace(/^\//,''); }
  }

  fullUrl(url) {
    if (this.isFullUrl(url)) {
      return url;
    } else {
      return `${this.baseUrl}/${this.mangleUrl(url)}`;
    }
  }

  get fullUrlRegEx() {
    return new RegExp('(([A-Za-z]+:)?//[^/]+)(/.*)');
  }

  isFullUrl(url) {
    return this.fullUrlRegEx.test(url);
  }

  withoutTrailingSlash(url) {
    if (url) { return (/\/$/.test(url) ? url.substring(0, url.length-1) : url); }
  }

  checkLocationUrl(respUrl, reqUrl) {
    if(this.isFullUrl(respUrl)) {
      return respUrl;
    } else {
      return this.fullUrlRegEx.exec(reqUrl)[1] + respUrl;
    }
  }
}
