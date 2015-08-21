var _ = require('lodash');
var url = require('url');

/**
 * Given a URL string, return a URL with a rewritten base.
 *
 * @param {stirng} link
 *   The link to rewrite.
 * @param {string} newBase
 *   The URL base to return.
 *
 * @return {string}
 *   link, rewritten with newBase.
 */
var rewriter = function (link, newBase) {
  var bParsed = _.omit(url.parse(newBase), ['href', 'search', 'path', 'query', 'hash']);
  var lParsed = url.parse(link);

  if (bParsed.pathname === '/') {
    delete bParsed.pathname;
  }
  else {
    bParsed.pathname = _.trimRight(bParsed.pathname, '/') + lParsed.pathname;
  }

  return url.format(_.merge(lParsed, bParsed));
};

/**
 * Recursively iterate over an object, find all links, and rewrite the bases.
 *
 * @param {string} newBase
 *   The new link base to use.
 * @param {object} doc
 *   The JSON API compatible document to iterate over.
 *
 * @return {object}
 *   An object with all links rewritten.
 */
var rewriteLinks = function (newBase, doc) {
  var ret = _.mapValues(doc, function (val, key) {
    if (key === 'links') {
      return _.mapValues(val, function (lVal) {
        if (_.isObject(lVal)) {
          lVal.href = rewriter(lVal.href, newBase);
          return lVal;
        }
        return rewriter(lVal, newBase);
      });
    }

    if (Array.isArray(val)) {
      return val.map(function (aVal) {
        if (!Array.isArray(aVal) && _.isObject(aVal)) {
          return rewriteLinks(newBase, aVal);
        }
        return aVal;
      });
    }
    if (_.isObject(val)) {
      return rewriteLinks(newBase, val);
    }

    return val;
  });
  return ret;
};

module.exports = {
  rewriter: rewriter,
  rewriteLinks: rewriteLinks
};

