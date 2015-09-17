import ResourceMapper from "./ResourceMapper.js";

export default class ListResourceMapper extends ResourceMapper {
  constructor(
    services,
    response,
    ItemResourceClass,
    endpoint = null
  ) {

    super(
      services,
      response,
      services.ListResource // simply import?
    );

    this.ItemResourceClass = ItemResourceClass;
    this.mapperFactory = services.manyResourceMapperFactory;
    this.serializerFactory = services.manyResourceSerializerFactory;
    this.endpoint = endpoint;
  }

  mappedDelegationFn(name) {
    return function(...args) {
      return this.resource[name](...args);
    };
  }

  mappedRetreiveFn(name) {
    var mapped = this.mapped;
    return function(...args) {
      return this.resource.self()[name](mapped,...args);
    };
  }

  mapNestedRelationships() {
    this.resource = this.mapped;
    var manyResourceMapper = this.mapperFactory(
      this.transport,
      this.resource.pathGet("$.data"),
      this.ItemResourceClass
    );
    manyResourceMapper.uriTemplate = this.resource.pathGet("$.links.template");
    this.mapped = manyResourceMapper.map();
    this.mapped.resource = this.resource;

    this.mapped.url         = this.mappedDelegationFn("url");
    this.mapped.uriTemplate = this.mappedDelegationFn("uriTemplate");
    this.mapped.uriParams   = this.mappedDelegationFn("uriParams");

    this.mapped.remove = this.mappedRetreiveFn("remove");
    this.mapped.update = this.mappedRetreiveFn("update");
    this.mapped.load   = this.mappedRetreiveFn("load");

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
