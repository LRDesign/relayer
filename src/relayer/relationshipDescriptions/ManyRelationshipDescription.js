import MultipleRelationshipDescription from "./MultipleRelationshipDescription.js";
import {SimpleFactory} from "../SimpleFactoryInjector.js";

@SimpleFactory('ManyRelationshipDescriptionFactory',
  ['ManyRelationshipInitializerFactory',
  'ManyResourceMapperFactory',
  'ManyResourceSerializerFactory',
  'Inflector',
  'EmbeddedRelationshipTransformerFactory',
  'SingleFromManyTransformerFactory',
  'LoadedDataEndpointFactory'])
export default class ManyRelationshipDescription extends MultipleRelationshipDescription {

}
