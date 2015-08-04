import RelationshipInitializer from '../initializers/RelationshipInitializer.js';
import ResourceMapper from '../mappers/ResourceMapper.js';
import ResourceSerializer from '../serializers/ResourceSerializer.js';
import inflectorSingleton from "../singletons/Inflector.js";
import makeFac from "../dumbMetaFactory.js";

export default class RelationshipDescription {
  constructor( name, ResourceClass, initialValues,
    relationshipInitializerFactory = makeFac(RelationshipInitializer),
    resourceMapperFactory          = makeFac(ResourceMapper),
    resourceSerializerFactory      = makeFac(ResourceSerializer),
    inflector                      = inflectorSingleton
  ) {


    this.initializer = relationshipInitializerFactory(ResourceClass, initialValues);
    this.mapperFactory = resourceMapperFactory;
    this.serializerFactory = resourceSerializerFactory;
    this.inflector = inflector;
    this.name = name;
    this.ResourceClass = ResourceClass;
    this.initialValues = initialValues;
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

  decorateEndpoint(endpoint, uriParams) {
    // override
  }

}
