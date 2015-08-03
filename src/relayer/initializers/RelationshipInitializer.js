export function factory(ResourceClass, initialValues) {
  return partialFactory(ResourceClass, initialValues, (...args) => {
    return new RelationshipInitializer(...args);
  });
}

export function partialFactory(ResourceClass, initialValues, subfactory) {
  return subfactory(ResourceClass, initialValues);
}

export default class RelationshipInitializer {
  constructor(ResourceClass, initialValues) {
    this.ResourceClass = ResourceClass;
    this.initialValues = initialValues;
  }

  initialize() {
  }

}
