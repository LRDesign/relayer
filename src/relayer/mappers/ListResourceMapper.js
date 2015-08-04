import ResourceMapper from "./ResourceMapper.js";
import ListResource from "../ListResource.js";
import ManyResourceMapper from "./ManyResourceMapper.js";

import makeFac from "../dumbMetaFactory.js";

export default class ListResourceMapper extends ResourceMapper {
  constructor(
    transport,
    response,
    ListResource,
    ItemResourceClass,
    endpoint = null,
    manyResourceMapperFactory = makeFac(ManyResourceMapper),

    ...superArgs

  ) {

    super(
      transport,
      response,
      serializerFactory,
      ...superArgs
    );

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
    };

    var ItemResourceClass = this.ItemResourceClass;
    this.mapped.new = function() { return new ItemResourceClass(); };
  }
}
