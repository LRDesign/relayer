import ResourceTransformer from "./ResourceTransformer.js"

export default class PrimaryResourceTransformer extends ResourceTransformer {
  constructor(primaryResourceMapperFactory,
    primaryResourceSerializerFactory,
    ResourceClass) {
    super();
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
        return this.primaryResourceMapperFactory(endpoint.transport,
          resolvedResponse.data,
          this.ResourceClass,
          this.primaryResourceMapperFactory,
          this.primaryResourceSerializerFactory,
          endpoint).map();
      }
    ).catch(
      (resolvedError) => {
        throw this.primaryResourceMapperFactory(endpoint.transport,
          resolvedError.data,
          this.ResourceClass.errorClass,
          this.primaryResourceMapperFactory,
          this.primaryResourceSerializerFactory,
          endpoint).map();
      }
    );
  }
}
