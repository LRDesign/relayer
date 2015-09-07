import DataWrapper from "./DataWrapper.js";

var paths = {
  publicUrl: "$.links.public",
  adminUrl: "$.links.admin",
  selfUrl: "$.links.self"
};

export default class Resource extends DataWrapper {
  constructor(responseData) {
    super(responseData);
    if (!responseData) {
      this.emptyData();
    }
    this.errorReason = null;
    this.templatedUrl = null
    this.resolved = false;
    this._dirty = false;
  }

  static get relationships() {
    if (!this.hasOwnProperty("_relationships")) {
      this._relationships = Object.create(this._relationships || {})
    }
    return this._relationships;
  }

  static description(resourceDescriptionFactory) {
    var parent = Object.getPrototypeOf(this);
    if (parent !== Resource && parent.description) {
      parent.description(resourceDescriptionFactory);
    }
    if(!this.hasOwnProperty("resourceDescription")) {
      var parentDesc = this.resourceDescription;
      this.resourceDescription = resourceDescriptionFactory();
      if(parentDesc){
        this.resourceDescription.chainFrom(parentDesc);
      }
    }
    return this.resourceDescription;
  }

  get url() {
    return this.templatedUrl && this.templatedUrl.url;
  }

  get uriTemplate() {
    return this.templatedUrl && this.templatedUrl.uriTemplate;
  }

  get uriParams() {
    return this.templatedUrl && this.templatedUrl.uriParams;
  }

  create(resource, res, rej) {
    if (this.isPersisted) {
      return this.self().create(resource, res, rej)
    }
  }

  remove(res, rej) {
    if (this.isPersisted) {
      return this.self().remove(res, rej);
    }
  }

  update(res, rej) {
    if (this.isPersisted) {
      return this.self().update(this, res, rej);
    }
  }

  load(res, rej) {
    if (this.isPersisted) {
      return this.self().load(res, rej);
    }
  }

  get isDirty(){
    return this._dirty;
  }

  get isPersisted(){
    return ((this.self && this.self()) ? true : false );
  }

  // XXX used - needs replacement
  //get etag(){
  //  return this._response.restangularEtag;
  //}

  get _data(){
    return this._response["data"];
  }

  get _links(){
    return this._response["links"];
  }

  absorbResponse(response) {
    this._response = response;
  }

  setInitialValue(path, value) {

    this.initialValues.push({path, value});
  }

  get initialValues() {
    if (!this.hasOwnProperty("_initialValues")) {
      if (this._initialValues) {
        this._initialValues = this._initialValues.slice(0);
      } else {
        this._initialValues = [];
      }
    }
    return this._initialValues;
  }

  emptyData(){

    this._response = { data: {}, links: {} }
    this.initialValues.forEach((initialValue) => {
      this.pathBuild(initialValue.path, initialValue.value);
    });
    Object.keys(this.constructor.relationships).forEach((relationshipName) => {
      var relationshipDescription = this.constructor.relationships[relationshipName]
      if (relationshipDescription.initializeOnCreate) {
        var relationship = relationshipDescription.initializer.initialize();
        this.relationships[relationshipName] = relationship;
      }
    });
  }

  get relationships() {
    this._relationships = this._relationships || {};
    return this._relationships;
  }

  set relationships(relationships) {
    this._relationships = relationships;
    return this._relationships;
  }

  get shortLink() {
    return this.uriParams && this.uriParams[Object.keys(this.uriParams)[0]];
  }

  get response() {
    return this._response;
  }
}
