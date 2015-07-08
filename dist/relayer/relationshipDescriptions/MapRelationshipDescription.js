import MultipleRelationshipDescription from "./MultipleRelationshipDescription.js";
import {SimpleFactory} from "../SimpleFactoryInjector.js";

@SimpleFactory('MapRelationshipDescriptionFactory',
  ['MapRelationshipInitializerFactory',
  'MapResourceMapperFactory',
  'MapResourceSerializerFactory',
  'Inflector',
  'EmbeddedRelationshipTransformerFactory',
  'SingleFromManyTransformerFactory',
  'LoadedDataEndpointFactory'])
export default class MapRelationshipDescription extends MultipleRelationshipDescription {
}
