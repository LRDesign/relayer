0.0.8 08-29-2015
================
* Allow Angular 1.4x

0.0.7 08-04-2015
================
* Fixed error with calling update on embedded list

0.0.6 08-03-2015
================
* Convert all chained loads to being asynchronous -- until you call load, nothing happens
* Add utility functions for accessing aspects of relationships

0.0.5 07-24-2015
================
* Convert to using $q for promises for now

0.0.4 07-16-2015
================
* Fixed update for list resources
* Fix initialization so that;
  - a resource with no initial values does not error
  - a resource does not build embeds for all its relationships automatically

0.0.3 07-10-2015
================
* Fix issue with endless refetch for missing relationship

0.0.2
================
Mistakenly published to NPM before finished

0.0.1 07-07-2015
================
* The Initial Commit / Relayer
