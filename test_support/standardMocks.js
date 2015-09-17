export default function standardMocks(jasmine) {
  var transport = jasmine.createSpyObj("transport", ["something"]);
  var templatedUrl = jasmine.createSpyObj("templatedUrl", ["something"]);

  var endpoint = { transport, templatedUrl };

  var ResourceClass = function(thisResponse) {
    this.response = thisResponse;
    this.templatedUrl = templatedUrl;
  };

  ResourceClass.errorClass = function(thisResponse) {
    this.error = thisResponse;
  };

  var primaryResourceMapperFactory = jasmine.createSpy("primaryResourceMapperFactory").and.callFake(
    function(thisResponse, ThisResourceClass, thisEndpoint) {
    return {
      map() {
        return new ThisResourceClass(thisResponse);
      }
    };
  });

  var primaryResourceSerializerFactory = jasmine.createSpy("primaryResourceSerializerFactory").and.callFake(
    function(thisResource) {
    return {
      serialize() {
        return thisResource.response;
      }
    };
  });

  var services = jasmine.createSpyObj("services", ["something"]);

  return {
    transport, templatedUrl, endpoint, ResourceClass,
    primaryResourceMapperFactory, primaryResourceSerializerFactory, services
  };
}
