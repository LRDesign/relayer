[![Code Climate](https://codeclimate.com/github/LRDesign/relayer/badges/gpa.svg)](https://codeclimate.com/github/hannahhoward/a1atscript) [![Build Status](https://travis-ci.org/LRDesign/relayer.svg?branch=master)](https://travis-ci.org/hannahhoward/a1atscript)

# Relayer

[![Join the chat at https://gitter.im/LRDesign/relayer](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/LRDesign/relayer?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Relayer is a simple to use client side interface for talking to hypermedia API's. It's analogous to JS Data or Ember Data, but significantly more powerful in some respects because it assumes a backend that produces a hypermedia conformant API-- namely, your API embeds links in each JSON response to get to other resources. In that respect, where most client side libraries consume an API by making calls to specific endpoints known ahead of time, Relayer instead consumes an API much like a user interacts with a web browser -- it starts at a single URL it knows ahead of time, then follows links to get to other resources. This means that in a best case scenario, you can actually change all your API's endpoints without breaking your client.

It's a "Relayer" because finding resources is like a relay race -- each successive request sets up the next request.

*** Relayer is written in ES6 and assumes you are writing your code in ES6. At the moment, Relayer is specifically written for Angular.js, but uses the injection library A1AtScript, which makes Angular bindings very loose. At least in theory, relayer could be supported by any Javascript dependency injection system, including Ember's ***

*** You may want to read over the README at http://github.com/hannahhoward/a1atscript to get a simple tutorial on how A1Atscript works ***

## Setting up resources

The first step to using Relayer is to define some resources to represent responses from your backend API. You start by importing Relayer as RL.

``` javascript
import RL from "relayer";
```

Then you define some resource classes:
```javascript
class Author extends RL.Resource {

}
class BlogPost extends RL.Resource {

}
class Comment extends RL.Resource {

}
```
These classes stay empty unless you need to define computer properties or other helper methods

Instead, the bulk of the work in defining resources is when you use Relayer to describe the structure of the JSON for each of these resources on the backend.

```javascript
RL.Describe(Author, (desc) => {
  desc.property("nickname", "");
  desc.property("name", "");
  desc.hasList("blogPosts", BlogPost);
});

RL.Describe(Blog, (desc) => {
  desc.property("publishedAt", new Date());
  desc.property("body", "");
  desc.hasOne("author", Author);
  desc.hasList("comments", Comment);
});

RL.Describe(Comment, (desc) => {
  desc.property("body", "");
  desc.property("postedAt", new Date());
  desc.hasOne("blogPost", BlogPost)
})
```

RL.Describe takes two parameters-- the Resource Class you're describing and a callback function used to describe the resource. The callback functions only parameter is the object you'll be calling methods on to describe the resource. Some of the methods available to you are:

property - set a data property for the resource. This is the standard way to access simple data properties for this type of resource. It takes the name of the property (in lowerCamel -- it will get converted to snake_case before it goes out to the backend), and an initial value.

hasOne - tell relayer that this resource is linked to a single instance of another type of resource. This means the JSON returned from the server will either embed the other resource or provide a link to it.

hasList - tells relayer that this resource is linked to another resource which is itself a list of resources. This means the JSON returned from the server will either embed the list of resources or provide a link to get the list of resources

## Defining a top level resource and creating an API

So we've defined some resources, but how does Relayer start consuming the API from a single well known URL. To do this, we need to define a top level resource that represents response return from the well known URL. Usually, in relayer, the well known URL should return a response that is basically a list of links to other resorces. Here's an example top level resource:

```javascript
class Resources extends RL.Resource {

}

RL.Describe(Resources, (desc) => {
  var blogPosts = desc.hasList("blogPosts", BlogPost);
  blogPosts.linkTemplate = "blogPost";
  blogPosts.canCreate = true;
  var authors = desc.hasList("authors", Author);
  authors.linkTemplate = "author";
  authors.canCreate = false;
})
```

The final step is to connect our top level resource definition to our well known URL, which is done in an A1AtScript config block:

```javascript
@Config('relayerProvider')
function setupResources(relayerProvider) {
  relayerProvider.createApi("resources", Resources, "http://www.example.com/")
}

// setup an a1atscript module
var AppModule = new Module('myApp', [RL, setupResources])
bootstrap(AppModule);
```

This will actually instantiate an Angular services called "resources" (first parameter) that will talk to the well known url "http://www.example.com/" and use the Resources class to interpret the response that comes back from the server.

## Expected API JSON Format

In it's very first version, Relayer only supports a single custom JSON format for your API server. The json format is as follows:

1. All JSON data has two top level keys -- data and links. Data contains the actual information about the primary resource. Links contains urls for related resources. Links should have at least one key -- a "self" property -- which has the canonical URL for the resource.

2. Inside the data key, in addition to primary resource data, any key which itself has data and links keys is considered an embedded resource, and must be a partial or whole representation of a resource at a different HTTP endpoint.

So for example, a blog post with comments and an author. The author is embedded, the comments are only linked:

```javascript
{
  data: {
    published_at: "02/21/1848",
    body: "In bourgeois society capital is independent and has individuality, while the living person is dependent and has no individuality.",
    author: {
      data: {
        nickname: "karlm",
        name: "Monsieur Ramboz",
      },
      links: {
        self: "/authors/karlm",
        blog_posts: "/authors/karlm/blog_posts"
      }
    }
  },
  links: {
    self: "/blog_posts/1",
    comments: "/blog_posts/1/comments",
    author: "/authors/karlm"
  }
}
```

3. The "self" link is the "primary key". While resources may have attributes named "id" in the body, Relayer always assumes the unique identifier for a resource is the provided link to itself. After all, at the end of the day, a URL remains the cononical unique id for a resource on the web.

4. The API must provide URI templates for looking up specific resources from smaller bits of data. This provides short cuts to get to specific resources, primarily so that a Javascript client app can translate it's routed URLs to backend api calls easily, without sacrificing the flexibility of the API. Here is an example of a resource that returns URI templates for other endpoints in the app:

{
  data: {},
  links: {
    blog_posts: "/blog_posts",
    blog_post: "/blog_posts/{id}" // URI Template to lookup a single blog post,
    authors: "/authors",
    author: "authors/{nickname}" // URI template to lookup a single author
  }
}

#### Why This Format?

In order for relayer to work its magic, the API it talks to must provide a minimum level of information so that Relayer can consume the entire API from a single well known endpoint. The data format here was chosen because it is used in an upcoming Rails and AngularJS web framework we are also writing called Xing. While all of Xing is not yet released, if you are using Rails, the xing-backend gem will make it very easy to generate API's in the format expected by Relayer. It's also a great tool for building API backends in Rails.

*** This is the format for the first version -- in time Relayer will support well-known formats like JSON API, JSON-LD, and HAL ***

## Using Relayer

Ok, you've setup an API server, you've defined some resources on the client, how do you actually use them? This is where the fun comes in. The relayer interface for loading resources is extremely simple. Let's say I have an angular controller function, that takes in my resources API as an injected dependency. Here is how you would actually load blog pages, authors and comments from the example above

function MyController($scope, resources) {
  resources.blogPosts({id: 1}).comments().load((comments) => {
    $scope.comments = comments;
  });
}
MyController.$inject = ["$scope", "resources"]

or loading an author's blog posts:

resources.authors({nickname: "karlm").blogPosts().load((blogPosts) => {
  $scope.blogPosts = blogPosts;
});


*** load will execute a callback if one is given, otherwise it will return a promise ***

What about saving? For updating existing resources, it's very easy:

$scope.comments.update();
$scope.blogPosts.update();

If you have new resources, you'll need to do a POST:

var blogPost = $scope.blogPosts.new();
blogPost.body = "The production of too many useful things results in too many useless people."
$scope.blogPosts.create(blogPost)

All of the traversing of API's is done behind the scenes. Importantly, you don't actually have to even know if a related resource is linked or embedded in the JSON response that comes back to the server -- relayer will work with what you get and navigate as neccesary.

## Contributing

1. Initial setup

Fork the project, clone, run 'npm install'.

2. Running tests

While you're working on an issue in relayer, you'll want to have tests running. The proper syntax for this is "gulp tdd" -- this will start up a continuous server that watches for file changes and reruns your tests when they do

3. Babel test doublecheck

Relayer's tests use Traceur to compile the source by default. However, before you push, you should run 'npm test' which will run the tests once each with both Traceur and Babel.js. That way, you know any changes you make won't break someone's installation of relayer, even if they use Babel.js

4. Distribution

To take the source files and compile them down to various distributions, run the command "npm run-script dist". This will take the files in /src and output them in assembled format to /dist. Note however, if you are submitted a pull request on Github, you do not need to recreate the distributions. This will be done before the next point release.

5. Commit guidelines

If you are thinking of submitting a pull request, please follow these guidelines:
a. Do not submit features that do not have tests
b. Title your commits with "[Fix]" or "[Feature]" to help clarify what they are and update the changelog with these notes
c. Feel free to reach out on Gitter if you are considering a major feature before you implement.

# That's it. Enjoy!
