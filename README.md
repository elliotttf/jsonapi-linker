# JSON API Linker

[![Build Status](https://travis-ci.org/elliotttf/jsonapi-linker.svg)](https://travis-ci.org/elliotttf/jsonapi-linker)

This module allows link manipulation within JSON API documents. It expects to work with valid
JSON API objects, so review [the spec](http://jsonapi.org/) before using this module.

## Usage

```javascript
var linker = require('jsonapi-linker');

var doc = linker.rewriteLinks('http://public-url.example.com', {
  links: {
    self: 'http://origin-url.example.com/things/1'
  },
  // ...
});
/**
{
  links: {
    self: 'http://public-url.example.com/things/1'
  },
  // ...
}
*/
```

