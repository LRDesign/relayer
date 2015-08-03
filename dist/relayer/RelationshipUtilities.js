import {Service} from "a1atscript";
import {TemplatedUrl} from "./TemplatedUrl.js";

@Service('RelationshipUtilities')
export default class RelationshipUtilities {
  addMethods(target, resource, name) {
    target.get = function() {
      return resource.relationships[name];
    };
    target.present = function() {
      return resource.relationships[name] ? true : false;
    }
    target.set = function(newRelationship) {
      var linksPath = resource.constructor.relationships[name].linksPath;
      if (resource.relationships[name] instanceof TemplatedUrl) {
        resource.relationships[name].removeDataPathLink(resource, linksPath);
        if (!newRelationship) {
          resource.pathSet(linksPath, "");
        }
      }
      if (newRelationship instanceof TemplatedUrl) {
        newRelationship.addDataPathLink(resource, linksPath, false);
      }
      resource.relationships[name] = newRelationship;
      if (!resource.relationships[name]) {
        delete resource.relationships[name];
      }
    }
  }
}
