import DataWrapper from "./DataWrapper.js";

export default class APIError extends DataWrapper {

  constructor(responseData){
    super();
    this._response = responseData.data;
    this.unhandled = [];
    if(this.constructor.properties){
      this.unhandled = Object.getOwnPropertyNames(this.constructor.properties).filter((name) => {
        return this[name] && this[name].message;
      }).map((name) => {
        return name;
      });
    }
  }

  handleMessage(attrName) {
    if(this[attrName]) {
      this.unhandled = this.unhandled.filter((name) =>{
        return name != attrName;
      });
      return this[attrName].message;
    }
  }
}
