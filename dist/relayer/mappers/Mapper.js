export default class Mapper {
  constructor(transport, response, relationshipDescription, useErrors = false) {
    this.transport = transport;
    this.response = response;
    this.relationshipDescription = relationshipDescription;
    this.useErrors = useErrors;
  }

  get ResourceClass() {
    if (this.useErrors) {
      return this.relationshipDescription.ResourceClass.errorClass;
    } else {
      return this.relationshipDescription.ResourceClass;
    }
  }

  get mapperFactory() {
    return this.relationshipDescription.mapperFactory;
  }

  get serializerFactory() {
    return this.relationshipDescription.serializerFactory;
  }

  map() {
    this.initializeModel();
    this.mapNestedRelationships();
    return this.mapped;
  }
}
