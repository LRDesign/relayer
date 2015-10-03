import ResourceTransformer from "./ResourceTransformer.js";

export default class PrimaryResourceTransformer extends ResourceTransformer {
  constructor(services, primaryResourceMapperFactory, primaryResourceSerializerFactory, ResourceClass) {
    super(services);
    this.primaryResourceSerializerFactory = primaryResourceSerializerFactory;
    this.primaryResourceMapperFactory = primaryResourceMapperFactory;
    this.ResourceClass = ResourceClass;
  }

  transformRequest(endpoint, resource) {
    return this.primaryResourceSerializerFactory(resource).serialize();
  }

  transformResponse(endpoint, response) {
    return response.then(
      (resolvedResponse) => {
        endpoint.templatedUrl.etag = resolvedResponse.etag;
        var primResMap = this.primaryResourceMapperFactory(
          resolvedResponse.data,
          this.ResourceClass,
          endpoint);
          return primResMap.map();
      }
    ).catch(
      (resolvedError) => {
        throw this.primaryResourceMapperFactory(
          resolvedError.data,
          this.ResourceClass.errorClass,
          endpoint).map();
      }
    );
  }
}
