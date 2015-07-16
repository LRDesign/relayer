import {SimpleFactory} from "../SimpleFactoryInjector.js";
import ResourceMapper from "./ResourceMapper.js";

@SimpleFactory('ListResourceMapperFactory', [
  'TemplatedUrlFromUrlFactory',
  'ResourceBuilderFactory',
  'PrimaryResourceBuilderFactory',
  'ListResource',
  'ManyResourceMapperFactory'])
export default class ListResourceMapper extends ResourceMapper {
  constructor(templatedUrlFromUrlFactory,
      resourceBuilderFactory,
      primaryResourceBuilderFactory,
      ListResource,
      manyResourceMapperFactory,
      transport,
      response,
      ItemResourceClass,
      mapperFactory,
      serializerFactory,
      endpoint) {

    super(templatedUrlFromUrlFactory,
      resourceBuilderFactory,
      primaryResourceBuilderFactory,
      transport,
      response,
      ListResource,
      mapperFactory,
      serializerFactory);
    this.ItemResourceClass = ItemResourceClass;
    this.manyResourceMapperFactory = manyResourceMapperFactory;
    this.endpoint = endpoint;
  }

  mapNestedRelationships() {
    this.resource = this.mapped;
    var manyResourceMapper = this.manyResourceMapperFactory(this.transport, this.resource.pathGet("$.data"), this.ItemResourceClass);
    manyResourceMapper.uriTemplate = this.resource.pathGet("$.links.template");
    this.mapped = manyResourceMapper.map();
    this.mapped.resource = this.resource;
    ["url", "uriTemplate", "uriParams"].forEach((func) => {
      this.mapped[func] = function(...args) {
        return this.resource[func](...args);
      };
    });
    var mapped = this.mapped;
    ["remove", "update", "load"].forEach((func) => {
      this.mapped[func] = function(...args) {
        return this.resource.self()[func](mapped,...args);
      };
    });
    this.mapped.create = function(...args) {
      return this.resource.create(...args).then((created) => {
        this.push(created);
        return created;
      });
    }

    var ItemResourceClass = this.ItemResourceClass;
    this.mapped.new = function() { return new ItemResourceClass(); }
  }
}
