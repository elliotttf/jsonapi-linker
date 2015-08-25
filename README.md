# JSON API Linker

[![Build Status](https://travis-ci.org/elliotttf/jsonapi-linker.svg?branch=master)](https://travis-ci.org/elliotttf/jsonapi-linker)
[![Coverage Status](https://coveralls.io/repos/elliotttf/jsonapi-linker/badge.svg?branch=master&service=github)](https://coveralls.io/github/elliotttf/jsonapi-linker?branch=master)

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

You may also designate a prefix to remove from the original string, e.g.:

```javascript
var doc = linker.rewriteLinks('http://public-url.example.com', '/api/v1', {
  links: {
    self: 'http://origin-url.example.com/api/v1/things/1'
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

