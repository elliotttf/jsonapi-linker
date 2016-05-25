var _ = require('lodash');
var url = require('url');

/**
 * Given a URL string, return a URL with a rewritten base.
 *
 * @param {stirng} link
 *   The link to rewrite.
 * @param {string} newBase
 *   The URL base to return.
 * @param {*} rmPrefix
 *   (optional) A prefix string or RegExp to remove from the original link.
 *
 * @return {string}
 *   link, rewritten with newBase.
 */
var rewriter = function (link, newBase, rmPrefix) {
  var newBaseParsed = _.omit(url.parse(newBase), ['href', 'search', 'path', 'query', 'hash']);
  var parsedLink = url.parse(link);

  if (rmPrefix) {
    parsedLink.pathname = parsedLink.pathname.replace(rmPrefix, '');
  }

  if (newBaseParsed.pathname === '/') {
    newBaseParsed.pathname = parsedLink.pathname;
  }
  else {
    newBaseParsed.pathname = _.trimEnd(newBaseParsed.pathname, '/') + parsedLink.pathname;
  }

  return url.format(_.merge(parsedLink, newBaseParsed));
};

/**
 * Recursively iterate over an object, find all links, and rewrite the bases.
 *
 * @param {string} newBase
 *   The new link base to use.
 * @param {*} rmPrefix
 *   (optional) A string or regex prefix to remove from the original path.
 * @param {object} doc
 *   The JSON API compatible document to iterate over.
 *
 * @return {object}
 *   An object with all links rewritten.
 */
var rewriteLinks = function (newBase, rmPrefix, doc) {
  if (typeof doc === 'undefined') {
    doc = rmPrefix;
    rmPrefix = undefined;
  }
  var ret = _.mapValues(doc, function (val, key) {
    if (key === 'links') {
      return _.mapValues(val, function (lVal) {
        if (_.isObject(lVal)) {
          lVal.href = rewriter(lVal.href, newBase, rmPrefix);
          return lVal;
        }
        return rewriter(lVal, newBase, rmPrefix);
      });
    }

    if (Array.isArray(val)) {
      return val.map(function (aVal) {
        if (!Array.isArray(aVal) && _.isObject(aVal)) {
          return rewriteLinks(newBase, rmPrefix, aVal);
        }
        return aVal;
      });
    }
    if (_.isObject(val)) {
      return rewriteLinks(newBase, rmPrefix, val);
    }

    return val;
  });
  return ret;
};

module.exports = {
  rewriter: rewriter,
  rewriteLinks: rewriteLinks
};

