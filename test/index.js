/**
 * NOTE: The trailing slash on the root URL is only needed to make testing
 * easier, the module will work with or without a trailing slash on the
 * new base.
 */

var linker = require('../');
module.exports = {
  rewriter: {
    base: function (test) {
      test.expect(1);

      var oldLink = 'http://old.example.com/';
      var newLink = 'http://new.example.com/';

      var testLink = linker.rewriter(oldLink, newLink);

      test.equal(testLink, newLink, 'Base link not rewritten.');
      test.done();
    },
    protocol: function (test) {
      test.expect(1);

      var oldLink = 'http://old.example.com/';
      var newLink = 'https://old.example.com/';

      var testLink = linker.rewriter(oldLink, newLink);

      test.equal(testLink, newLink, 'Protocol not rewritten.');
      test.done();
    },
    addPort: function (test) {
      test.expect(1);

      var oldLink = 'http://old.example.com/';
      var newLink = 'http://old.example.com:8080/';

      var testLink = linker.rewriter(oldLink, newLink);

      test.equal(testLink, newLink, 'Port not added.');
      test.done();
    },
    removePort: function (test) {
      test.expect(1);

      var oldLink = 'http://old.example.com:8080/';
      var newLink = 'http://old.example.com/';

      var testLink = linker.rewriter(oldLink, newLink);

      test.equal(testLink, newLink, 'Port not removed.');
      test.done();
    },
    path: function (test) {
      test.expect(1);

      var oldLink = 'http://old.example.com/images/1';
      var newLink = 'http://new.example.com/';

      var testLink = linker.rewriter(oldLink, newLink);

      test.equal(testLink, newLink + 'images/1', 'Base link not rewritten.');
      test.done();
    },
    basePath: function (test) {
      test.expect(2);

      var oldLink = 'http://old.example.com/images/1';
      var newLink = 'http://new.example.com/v1';
      var newLinkTrailing = newLink + '/';

      var testLink = linker.rewriter(oldLink, newLink);
      var testLink2 = linker.rewriter(oldLink, newLinkTrailing);

      test.equal(testLink, newLink + '/images/1', 'Base link not rewritten.');
      test.equal(testLink2, newLinkTrailing + 'images/1', 'Base link not rewritten.');
      test.done();
    },
    withQuery: function (test) {
      test.expect(1);

      var oldLink = 'http://old.example.com/images/1?fields=src';
      var newLink = 'http://new.example.com/';

      var testLink = linker.rewriter(oldLink, newLink);

      test.equal(testLink, newLink + 'images/1?fields=src', 'Base link not rewritten.');
      test.done();
    },
    removePrefixString: function (test) {
      test.expect(1);

      var oldLink = 'http://old.example.com/api/v1/images/1';
      var newLink = 'http://new.example.com/';

      var testLink = linker.rewriter(oldLink, newLink, '/api/v1');

      test.equal(testLink, newLink + 'images/1', 'Prefix not removed');
      test.done();
    },
    removePrefixRegEx: function (test) {
      test.expect(1);

      var oldLink = 'http://old.example.com/api/v1/images/1';
      var newLink = 'http://new.example.com/';

      var testLink = linker.rewriter(oldLink, newLink, /\/api\/v\d+/);

      test.equal(testLink, newLink + 'images/1', 'Prefix not removed');
      test.done();
    }
  },
  rewriteLinks: {
    linkString: function (test) {
      test.expect(1);

      var rewritten = linker.rewriteLinks('http://new.example.com', {
        links: {
          self: 'http://old.example.com/images/1'
        }
      });

      test.equal(
        rewritten.links.self,
        'http://new.example.com/images/1',
        'Simple link not rewritten.'
      );
      test.done();
    },
    linkObject: function (test) {
      test.expect(2);

      var rewritten = linker.rewriteLinks('http://new.example.com', {
        links: {
          self: {
            href: 'http://old.example.com/images/1',
            meta: {
              count: 10
            }
          }
        }
      });

      test.equal(
        rewritten.links.self.href,
        'http://new.example.com/images/1',
        'Simple link not rewritten.'
      );
      test.equal(rewritten.links.self.meta.count, 10, 'Metadata unexpectedly changed.');
      test.done();
    },
    array: function (test) {
      test.expect(2);

      var rewritten = linker.rewriteLinks('http://new.example.com', {
        data: [
          {
            links: {
              self: 'http://old.example.com/images/1'
            }
          },
          {
            links: {
              self: 'http://old.example.com/images/2'
            }
          }
        ]
      });

      test.equal(
        rewritten.data[0].links.self,
        'http://new.example.com/images/1',
        'Array link not rewritten.'
      );
      test.equal(
        rewritten.data[1].links.self,
        'http://new.example.com/images/2',
        'Array link not rewritten.'
      );
      test.done();
    },
    nested: function (test) {
      test.expect(1);

      var rewritten = linker.rewriteLinks('http://new.example.com', {
        data: {
          relationships: {
            author: {
              links: {
                self: 'http://old.example.com/images/1/author'
              }
            }
          }
        }
      });

      test.equal(
        rewritten.data.relationships.author.links.self,
        'http://new.example.com/images/1/author',
        'Nested link not rewritten.'
      );
      test.done();
    },
    unalteredArray: function (test) {
      test.expect(1);

      var rewritten = linker.rewriteLinks('http://new.example.com', {
        data: {
          attributes: {
            images: [
              ['one','two']
            ]
          }
        }
      });

      test.equal(rewritten.data.attributes.images[0][0], 'one', 'Array altered.');
      test.done();
    },
    unalteredObject: function (test) {
        test.expect(1);

        var rewritten = linker.rewriteLinks('http://new.example.com', {
          data: {
            attributes: {
              title: 'test'
            }
          }
        });

        test.equal(rewritten.data.attributes.title, 'test', 'Object altered.');
        test.done();
    }
  }
};

