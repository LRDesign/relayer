import {SimpleFactory} from "../SimpleFactoryInjector.js";
import ResourceMapper from "./ResourceMapper.js";

@SimpleFactory('ListResourceMapperFactory', [
  'TemplatedUrlFromUrlFactory',
  'ResourceBuilderFactory',
  'PrimaryResourceBuilderFactory',
  'PrimaryResourceTransformerFactory',
  'ManyResourceMapperFactory'])
export default class ListResourceMapper extends ResourceMapper {
  constructor(templatedUrlFromUrlFactory,
      resourceBuilderFactory,
      primaryResourceBuilderFactory,
      primaryResourceTransformerFactory,
      manyResourceMapperFactory,
      transport,
      response,
      relationshipDescription,
      endpoint,
      useErrors = false) {

    super(templatedUrlFromUrlFactory,
      resourceBuilderFactory,
      primaryResourceBuilderFactory,
      primaryResourceTransformerFactory,
      transport,
      response,
      relationshipDescription,
      endpoint,
      useErrors);
    this.manyResourceMapperFactory = manyResourceMapperFactory;
  }

  get ResourceClass() {
    return this.relationshipDescription.ListResourceClass;
  }

  get ItemResourceClass() {
    return this.relationshipDescription.ResourceClass;
  }

  mapNestedRelationships() {

    // add mappings for list resource
    super.mapNestedRelationships();

    this.resource = this.mapped;
    var manyResourceMapper = this.manyResourceMapperFactory(this.transport, this.resource.pathGet("$.data"), this.relationshipDescription);
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
    Object.keys(this.resource.relationships).forEach((key) => {
      this.mapped[key] = function(...args) {
        return this.resource[key](...args);
      }
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
