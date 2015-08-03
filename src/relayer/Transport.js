export default class Transport {

  constructor(urlHelper, $http){
    this.http = $http;
    this.urlHelper = urlHelper;
  }

  get(url, etag = null){
    var getParams = {
      method: "GET",
      url: this.urlHelper.fullUrl(url)
    };
    if (etag) {
      getParams.headers = {};
      getParams.headers['If-None-Match'] = etag;
    }
    return this.resolve(this.http(getParams));
  }

  put(url, data, etag = null){
    var putParams = {
      method: "PUT",
      url: this.urlHelper.fullUrl(url),
      data: data
    };
    if (etag) {
      putParams.headers = {};
      putParams.headers['If-Match'] = etag;
    }
    return this.resolve(this.http(putParams));
  }

  post(url, data){
    return this.resolve(this.http({
      method: "POST",
      url: this.urlHelper.fullUrl(url),
      data: data
    }));
  }

  delete(url){
    return this.resolve(this.http({
      method: 'DELETE',
      url: this.urlHelper.fullUrl(url)
    }));
  }

  resolve(backendResponds){
    return backendResponds.then((fullResponse) => {
      if(fullResponse.status === 201 && fullResponse.headers().location){
        var locationUrl = this.absolutizeResponseLocation(fullResponse);
        return this.get(locationUrl);
      } else {
        var response = {};
        response.data = fullResponse.data;
        response.etag = fullResponse.headers().ETag;
        return response;
      }
    }, (errorResponse) => {
      throw errorResponse;
    });
  }

  absolutizeResponseLocation(fullResponse) {
    return this.urlHelper.checkLocationUrl(fullResponse.headers().location, fullResponse.config.url);
  }

}
