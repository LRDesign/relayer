export default class Locator {
  constructor() {
    this.memos = {};
  }

  buildFn(buildClass){
    var builder = function(...args) {
      return new buildClass(...args);
    };
    // I got tired of these being "anonymous function" in debug
    Object.defineProperty(builder, "name", {
                            configurable: true,
                            writable: false,
                            enumerable: false,
                            value: `build${buildClass.name}`
                          });

    return builder;
  }

  applySelfToBuilder(buildClass){
    var {buildFn} = this;
    var locator = this;
    var applied = function(...args) {
      return buildFn(buildClass)(locator, ...args);
    };
    Object.defineProperty(applied, "name", {
                            configurable: true,
                            writable: false,
                            enumerable: false,
                            value: `serviceInjected${buildClass.name}`
                          });

    return applied;
  }

  memoize(name, builder) {
    if(!this.memos[name]) {
      this.memos[name] = builder();
    }
    return this.memos[name];
  }

  mustHave(name) {
    if(this.memos[name]){
      return this.memos[name];
    } else {
      throw new Error(`Configuration error: ${name} not set on Relayer ServiceLocator`);
    }
  }

  remember(name, value) {
    this.memos[name] = value;
  }

  forget(name){
    this.memos[name] = null;
  }

  get thenableBuilder() {
    return this._buildThenable;
  }

  set thenableBuilder(builder) {
    this._buildThenable = builder;
    this.forget("promise");
    return builder;
  }

}
