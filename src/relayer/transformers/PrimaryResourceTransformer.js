import ResourceTransformer from "./ResourceTransformer.js";

export default class PrimaryResourceTransformer extends ResourceTransformer {
  constructor(services, ResourceClass, primaryResourceMapperFactory, primaryResourceSerializerFactory) {
    super(services);
    this.ResourceClass = ResourceClass;
    this.primaryResourceSerializerFactory = primaryResourceSerializerFactory;
    this.primaryResourceMapperFactory = primaryResourceMapperFactory;
  }

  transformRequest(endpoint, resource) {
    return this.primaryResourceSerializerFactory(resource).serialize();
  }

  transformResponse(endpoint, response) {
    return response.then(
      (resolvedResponse) => {
        endpoint.templatedUrl.etag = resolvedResponse.etag;
        return this.primaryResourceMapperFactory(
          resolvedResponse.data,
          this.ResourceClass,
          this.primaryResourceMapperFactory,
          this.primaryResourceSerializerFactory,
          endpoint).map();
      }
    ).catch(
      (resolvedError) => {
        throw this.primaryResourceMapperFactory(
          resolvedError.data,
          this.ResourceClass.errorClass,
          this.primaryResourceMapperFactory,
          this.primaryResourceSerializerFactory,
          endpoint).map();
      }
    );
  }
}
