export default class Locator {
  constructor() {
    this.memos = {};
  }

  buildFn(buildClass){
    return (...args) => new buildClass(...args);
  }

  applySelfToBuilder(buildClass){
    return (...args) => {
      return this.buildFn(buildClass)(this, ...args);
    };
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
