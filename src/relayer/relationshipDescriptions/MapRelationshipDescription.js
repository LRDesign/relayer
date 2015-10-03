import MultipleRelationshipDescription from "./MultipleRelationshipDescription.js";

export default class MapRelationshipDescription extends MultipleRelationshipDescription {
  constructor(...args){
    super(...args);
  }

  initializerFactory(services){
    return services.mapRelationshipInitializerFactory;
  }

  mapperFactory(services) {
    return services.mapResourceMapperFactory;
  }

  serializerFactory(services) {
    return services.mapResourceSerializerFactory;
  }
}
