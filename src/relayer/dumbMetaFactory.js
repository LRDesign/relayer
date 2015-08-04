export default function dumbMetaFactory(buildClass){
  return function(...args){
    return new buildClass(...args);
  };
}
