import jsonPath from './jsonpath.js';

export default class DataWrapper {
  constructor(response){
    this._response = response;
  }

  pathBuild(path, value) {
    //XXX ???
    //Partly this requires the opposite of jsonPath - find a reasonable set of fields
    //that would satisfy the path... or paths
    //i.e. we've been neglecting jsonPath's "descendant" operator

    var segments = path.split(".");

    var root = segments.shift();
    if(root !== "$"){
      console.log(`root of path ${path} was ${root}, not "$"`);
      return false;
    }

    var target = segments.pop();
    var thumb = this._response;

    segments.forEach((segment) => {
      if(segment === ''){ return; }

      if(!thumb[segment]){
        thumb[segment] = {}; //XXX arrays? next segment is number? or [] in path...
      }

      thumb = thumb[segment];
    });

    thumb[target] = value;
  }

  pathGet(path){
    var temp = jsonPath(this._response, path, {flatten: false, wrap: true});
    if (temp.length === 0) {
      return undefined;
    } else {
      return temp[0];
    }
  }

  pathSet(jsonpath, value){
    var path = jsonPath(this._response, jsonpath, {wrap: true, resultType: "path"});
    if (path && path.length > 0) {
      path = path[0];
      if(path[0] !== "$"){
        console.log(`Warning! root of normalized path '${path}' was '${path[0]}', not '$'`);
      }
      var root = path.shift();
      var target = path.pop();
      var thumb = this._response;
      for(var segment of path){
        thumb = thumb[segment];
      }
      if(thumb[target] != value){
        this._dirty = true;
      }
      thumb[target] = value;
    } else {
      // raise error here?
    }
  }

  pathClear(jsonpath){
    var path = jsonPath(this._response, jsonpath, {wrap: true, resultType: "path"});
    if(path && path.length === 0){ return; }
    path = path[0];
    if(path[0] !== "$"){
      console.log(`root of normalized path was '${path[0]}', not '$'`);
    }
    var root = path.shift();
    var target = path.pop();
    var thumb = this._response;
    for(var segment of path){
      thumb = thumb[segment];
    }
    delete thumb[target];
  }
}
