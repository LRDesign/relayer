export default class RelationshipDescription {
  constructor( description, name, ResourceClass, initialValues) {
    this.name = name;
    this.ResourceClass = ResourceClass;
    this.initialValues = initialValues;

    this.inflector = description.inflector;

    this.async = true;
    if (initialValues === undefined) {
      this.initializeOnCreate = false;
    } else {
      this.initializeOnCreate = true;
    }
  }

  get linksPath() {
    this._linksPath = this._linksPath || `$.links.${this.inflector.underscore(this.name)}`;
    return this._linksPath;
  }

  set linksPath(linksPath) {
    this._linksPath = linksPath;
    return this._linksPath;
  }

  get dataPath() {
    this._dataPath = this._dataPath || `$.data.${this.inflector.underscore(this.name)}`;
    return this._dataPath;
  }

  set dataPath(dataPath) {
    this._dataPath = dataPath;
    return this._dataPath;
  }

  initializer(services) {
  }

  decorateEndpoint(endpoint, uriParams) {
    // override
  }

}
