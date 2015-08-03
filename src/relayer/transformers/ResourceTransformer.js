// the idea is to extract the logic that handles creating the resource class
// from the backend's returned data
// and setting up the data to post to the backend to its own class
// but then that got me thinking this is a better spot in general to add
// customization like lists, admin role endpoints, paginated endpoints, etc
// I even had the idea that these could potentially be chained

export function factory(){
  return new ResourceTransformer();
}

export default class ResourceTransformer {
  transformRequest(endpoint, resource) {
    return resource;
  }

  transformResponse(endpoint, response) {
    return response;
  }
}
