import {Service} from 'a1atscript';

var resourcesToInitialize = [];

export function describeResource(resourceClass, defineFn){
  resourcesToInitialize.push({resourceClass, defineFn});
}

@Service('InitializedResourceClasses', ['ResourceDescriptionFactory'])
export class InitializedResourceClasses {
  constructor(resourceDescriptionFactory) {
    this.resourceDescriptionFactory = resourceDescriptionFactory;
    this.initializeClasses();
  }

  initializeClasses() {
    resourcesToInitialize.forEach((resourceToInitialize) => {
      var resourceClass = resourceToInitialize.resourceClass;
      var defineFn = resourceToInitialize.defineFn;
      var resourceDescription = resourceClass.description(this.resourceDescriptionFactory);
      // wrap-around definitions because...
      defineFn(resourceDescription);

    });

    return resourcesToInitialize.map((resourceToInitialize) => {
      var resourceClass = resourceToInitialize.resourceClass;
      var resourceDescription = resourceClass.resourceDescription;
      var errorClass = function (responseData) {
        APIError.call(this);
      }
      errorClass.relationships = {};
      errorClass.prototype = Object.create(APIError.prototype);
      errorClass.prototype.constructor = errorClass;
      resourceDescription.applyToResource(resourceClass.prototype);
      resourceDescription.applyToError(errorClass.prototype);
      resourceClass.errorClass = errorClass;
      return resourceClass;
    });
  }
}
