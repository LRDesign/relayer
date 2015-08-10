import ResourceDecorator from "./ResourceDecorator.js";
import {TemplatedUrl} from "../TemplatedUrl.js";
import RelationshipUtilities from "../RelationshipUtilities.js";

export default class RelatedResourceDecorator extends ResourceDecorator {

  constructor(services, name, relationship, relationshipUtilities = new RelationshipUtilities()) {
    super(services, name);

    this.promiseEndpointFactory = services.promiseEndpointFactory;
    this.relationshipUtilities = relationshipUtilities; //XXX to services?
    this.relationship = relationship;
  }

  get resourceFn(){
    if(!this._resourceFn) {
      var name = this.name;
      var relationship = this.relationship;
      var promiseEndpointFactory = this.promiseEndpointFactory;
      var relationshipUtilities = this.relationshipUtilities;
      this._resourceFn = function(uriParams, recursiveCall = false) {
        if (relationship.async && this.isPersisted) {
          var endpoint;
          if (!this.relationships[name]) {
            if (recursiveCall == false) {
              endpoint = promiseEndpointFactory(() => {
                return this.self().load().then((resource) => {
                  return resource[name](uriParams, true);
                })
              });
            } else {
              throw "Error: Unable to find relationship, even on canonical resource";
            }
          } else if (this.relationships[name] instanceof TemplatedUrl) {
            endpoint = relationship.linkedEndpoint(this, uriParams);
          } else {
            endpoint = relationship.embeddedEndpoint(this, uriParams);
          }
          relationship.ResourceClass.resourceDescription.applyToEndpoint(endpoint);
          relationshipUtilities.addMethods(endpoint, this, name);
          return endpoint;
        } else {
          if (this.relationships[name] instanceof TemplatedUrl) {
            throw "Error: non-async relationships must be embedded";
          } else {
            if (uriParams) {
              return this.relationships[name][uriParams];
            } else {
              return this.relationships[name];
            }
          }
        }
      }
    }

    return this._resourceFn;
  }

  get errorFn() {
    if(!this._errorFn) {
      var name = this.name;
      var path = this.path;
      var relationship = this.relationship;
      this._errorFn = function(uriParams) {
        if (this.relationships[name] instanceof TemplatedUrl) {
          throw "Error: non-async relationships must be embedded"
        } else {
          if (uriParams) {
            return this.relationships[name][uriParams];
          } else {
            return this.relationships[name];
          }
        }
      };
    }
    return this._errorFn;
  }

  get endpointFn(){

    if(!this._endpointFn){

      var name = this.name;
      var description = this.relationship.ResourceClass.resourceDescription;
      var relationship = this.relationship;
      var promiseEndpointFactory = this.promiseEndpointFactory;
      this._endpointFn = function(uriParams = {}){
        // 'this' in here = Endpoint

        var newPromise = () => {
          return this.load().then((resource) => {
            if (relationship.async) {
              return resource[name](uriParams);
            } else {
              var endpoint = relationship.embeddedEndpoint(resource, uriParams);
              description.applyToEndpoint(endpoint);
              return endpoint;
            }
          });
        }

        var newEndpoint = promiseEndpointFactory(newPromise);

        relationship.decorateEndpoint(newEndpoint, uriParams);
        description.applyToEndpoint(newEndpoint);

        return newEndpoint;

      };
    }

    return this._endpointFn;
  }

  resourceApply(target){
    target.constructor.relationships[this.name] = this.relationship;
    this.addFunction(target, this.resourceFn);
  }

  errorsApply(target) {
    target.constructor.relationships[this.name] = this.relationship;
    this.addFunction(target, this.errorFn);
  }
  //backend.subone({}).subtwo({})
  //  means
  //backend.subone({}).load().then((subone) => { return subone.subtwo({}) })
  endpointApply(target){
    this.addFunction(target, this.endpointFn);
  }
}
