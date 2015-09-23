import APIError from "./APIError.js";

// XXX strip this down to just ResourceDescriptionTool
var resourcesToInitialize = [];

export function describeResource(resourceClass, defineFn){
  resourcesToInitialize.push({resourceClass, defineFn});
}

export class ResourceDescriptionTool {
  constructor(resourceDescriptionFactory) {
    this.resourceDescriptionFactory = resourceDescriptionFactory;
  }

  runDefinition(resourceClass, defineFn) {
    // wrap-around definitions because...
    defineFn( resourceClass.description(this.resourceDescriptionFactory) );
  }

  buildErrorClass(){
    var errorClass = function (responseData) {
      APIError.call(this);
    };
    errorClass.relationships = {};
    errorClass.prototype = Object.create(APIError.prototype);
    errorClass.prototype.constructor = errorClass;

    return errorClass;
  }

  initializeClass(resourceClass, defineFn){
    this.runDefinition(resourceClass, defineFn);

    var resourceDescription = resourceClass.resourceDescription;
    var errorClass = this.buildErrorClass();

    resourceDescription.applyToResource(resourceClass.prototype);
    resourceDescription.applyToError(errorClass.prototype);

    resourceClass.errorClass = errorClass;
    return resourceClass;
  }
}

export default class InitializedResourceClasses extends ResourceDescriptionTool {
  constructor(services) {
    super(services);
    this.initializeClasses();
  }

  initializeClasses() {
    return resourcesToInitialize.map((resourceToInitialize) => {
      var {resourceClass, defineFn} = resourceToInitialize;

      return this.initializeClass(resourceClass, defineFn);
    });
  }
}
