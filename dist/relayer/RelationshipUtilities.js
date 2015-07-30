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
      if (resource.relationships[name] instanceof TemplatedUrl) {
        var linksPath = resource.constructor.relationships[name].linksPath;
        resource.relationships[name].removeDataPathLink(resource, linksPath);
        resource.relationships[name] = newRelationship;
        if (newRelationship) {
          newRelationship.addDataPathLink(resource, linksPath, false);
        } else {
          resource.pathSet(linksPath, "");
        }
      } else {
        resource.relationships[name] = newRelationship;
      }
    }
  }
}
