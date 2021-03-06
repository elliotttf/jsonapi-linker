'use strict';

const _ = require('lodash');
const url = require('url');

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
const rewriter = (link, newBase, rmPrefix) => {
  const newBaseParsed = _.omit(url.parse(newBase), ['href', 'search', 'path', 'query', 'hash']);
  const parsedLink = url.parse(link);

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
const rewriteLinks = (newBase, rmPrefix, doc) => {
  if (typeof doc === 'undefined') {
    doc = rmPrefix;
    rmPrefix = undefined;
  }
  const ret = _.mapValues(doc, (val, key) => {
    if (key === 'links') {
      return _.mapValues(val, (lVal) => {
        if (_.isObject(lVal)) {
          lVal.href = rewriter(lVal.href, newBase, rmPrefix);
          return lVal;
        }
        return rewriter(lVal, newBase, rmPrefix);
      });
    }

    if (Array.isArray(val)) {
      return val.map((aVal) => {
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
  rewriter,
  rewriteLinks,
};

