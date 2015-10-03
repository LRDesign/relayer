import MultipleRelationshipDescription from "./MultipleRelationshipDescription.js";

export default class ManyRelationshipDescription extends MultipleRelationshipDescription {
  initializerFactory(services) {
    return services.manyRelationshipInitializerFactory;
  }

  mapperFactory(services) {
    return services.manyResourceMapperFactory;
  }

  serializerFactory(services) {
    return services.manyResourceSerializerFactory;
  }
}
