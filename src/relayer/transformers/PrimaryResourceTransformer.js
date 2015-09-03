import ResourceTransformer from "./ResourceTransformer.js"
import {SimpleFactory} from "../SimpleFactoryInjector.js"

@SimpleFactory('PrimaryResourceTransformerFactory', [])
export default class PrimaryResourceTransformer extends ResourceTransformer {
  constructor(relationshipDescription) {
    super();
    this.relationshipDescription = relationshipDescription;
  }

  get primaryResourceSerializerFactory() {
    return this.relationshipDescription.serializerFactory;
  }

  get primaryResourceMapperFactory() {
    return this.relationshipDescription.mapperFactory;
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
          this.relationshipDescription,
          endpoint).map();
      }
    ).catch(
      (resolvedError) => {
        throw this.primaryResourceMapperFactory(endpoint.transport,
          resolvedError.data,
          this.relationshipDescription,
          endpoint,
          true).map();
      }
    );
  }
}
