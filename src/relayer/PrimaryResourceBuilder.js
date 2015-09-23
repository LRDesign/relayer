export default class PrimaryResourceBuilder {
  constructor(services, response, ResourceClass) {
    this.services      = services;
    this.response      = response;
    this.ResourceClass = ResourceClass;
  }

  build(endpoint) {
    var resource = new this.ResourceClass(this.services, this.response);
    resource.templatedUrl = endpoint.templatedUrl;
    resource.templatedUrl.addDataPathLink(resource, "$.links.self");
    resource.self = function() {
      return endpoint;
    };

    return resource;
  }
}
