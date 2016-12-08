'use strict';

/**
 * NOTE: The trailing slash on the root URL is only needed to make testing
 * easier, the module will work with or without a trailing slash on the
 * new base.
 */

const linker = require('../');

module.exports = {
  rewriter: {
    base(test) {
      test.expect(1);

      const oldLink = 'http://old.example.com/';
      const newLink = 'http://new.example.com/';

      const testLink = linker.rewriter(oldLink, newLink);

      test.equal(testLink, newLink, 'Base link not rewritten.');
      test.done();
    },
    protocol(test) {
      test.expect(1);

      const oldLink = 'http://old.example.com/';
      const newLink = 'https://old.example.com/';

      const testLink = linker.rewriter(oldLink, newLink);

      test.equal(testLink, newLink, 'Protocol not rewritten.');
      test.done();
    },
    addPort(test) {
      test.expect(1);

      const oldLink = 'http://old.example.com/';
      const newLink = 'http://old.example.com:8080/';

      const testLink = linker.rewriter(oldLink, newLink);

      test.equal(testLink, newLink, 'Port not added.');
      test.done();
    },
    removePort(test) {
      test.expect(1);

      const oldLink = 'http://old.example.com:8080/';
      const newLink = 'http://old.example.com/';

      const testLink = linker.rewriter(oldLink, newLink);

      test.equal(testLink, newLink, 'Port not removed.');
      test.done();
    },
    path(test) {
      test.expect(1);

      const oldLink = 'http://old.example.com/images/1';
      const newLink = 'http://new.example.com/';

      const testLink = linker.rewriter(oldLink, newLink);

      test.equal(testLink, `${newLink}images/1`, 'Base link not rewritten.');
      test.done();
    },
    basePath(test) {
      test.expect(2);

      const oldLink = 'http://old.example.com/images/1';
      const newLink = 'http://new.example.com/v1';
      const newLinkTrailing = `${newLink}/`;

      const testLink = linker.rewriter(oldLink, newLink);
      const testLink2 = linker.rewriter(oldLink, newLinkTrailing);

      test.equal(testLink, `${newLink}/images/1`, 'Base link not rewritten.');
      test.equal(testLink2, `${newLinkTrailing}images/1`, 'Base link not rewritten.');
      test.done();
    },
    withQuery(test) {
      test.expect(1);

      const oldLink = 'http://old.example.com/images/1?fields=src';
      const newLink = 'http://new.example.com/';

      const testLink = linker.rewriter(oldLink, newLink);

      test.equal(testLink, `${newLink}images/1?fields=src`, 'Base link not rewritten.');
      test.done();
    },
    removePrefixString(test) {
      test.expect(1);

      const oldLink = 'http://old.example.com/api/v1/images/1';
      const newLink = 'http://new.example.com/';

      const testLink = linker.rewriter(oldLink, newLink, '/api/v1');

      test.equal(testLink, `${newLink}images/1`, 'Prefix not removed');
      test.done();
    },
    removePrefixRegEx(test) {
      test.expect(1);

      const oldLink = 'http://old.example.com/api/v1/images/1';
      const newLink = 'http://new.example.com/';

      const testLink = linker.rewriter(oldLink, newLink, /\/api\/v\d+/);

      test.equal(testLink, `${newLink}images/1`, 'Prefix not removed');
      test.done();
    },
  },
  rewriteLinks: {
    linkString(test) {
      test.expect(1);

      const rewritten = linker.rewriteLinks('http://new.example.com', {
        links: {
          self: 'http://old.example.com/images/1',
        },
      });

      test.equal(
        rewritten.links.self,
        'http://new.example.com/images/1',
        'Simple link not rewritten.');
      test.done();
    },
    linkObject: {
      withoutPrefix(test) {
        test.expect(2);

        const rewritten = linker.rewriteLinks('http://new.example.com', {
          links: {
            self: {
              href: 'http://old.example.com/images/1',
              meta: {
                count: 10,
              },
            },
          },
        });

        test.equal(
          rewritten.links.self.href,
          'http://new.example.com/images/1',
          'Simple link not rewritten.');
        test.equal(rewritten.links.self.meta.count, 10, 'Metadata unexpectedly changed.');
        test.done();
      },
      withPrefix(test) {
        test.expect(1);

        const rewritten = linker.rewriteLinks('http://new.example.com', /^\/api\/v\d+/, {
          links: {
            self: {
              href: 'http://old.example.com/api/v1/images/1',
              meta: {
                count: 10,
              },
            },
          },
        });

        test.equal(
          rewritten.links.self.href,
          'http://new.example.com/images/1',
          'Simple link not rewritten.');
        test.done();
      },
    },
    array(test) {
      test.expect(2);

      const rewritten = linker.rewriteLinks('http://new.example.com', {
        data: [
          {
            links: {
              self: 'http://old.example.com/images/1',
            },
          },
          {
            links: {
              self: 'http://old.example.com/images/2',
            },
          },
        ],
      });

      test.equal(
        rewritten.data[0].links.self,
        'http://new.example.com/images/1',
        'Array link not rewritten.');
      test.equal(
        rewritten.data[1].links.self,
        'http://new.example.com/images/2',
        'Array link not rewritten.');
      test.done();
    },
    nested: {
      noReplace(test) {
        test.expect(1);

        const rewritten = linker.rewriteLinks('http://new.example.com', {
          data: {
            relationships: {
              author: {
                links: {
                  self: 'http://old.example.com/images/1/author',
                },
              },
            },
          },
        });

        test.equal(
          rewritten.data.relationships.author.links.self,
          'http://new.example.com/images/1/author',
          'Nested link not rewritten.');
        test.done();
      },
      replace: {
        object: {
          string(test) {
            test.expect(1);

            const rewritten = linker.rewriteLinks('http://new.example.com', '/api/v1', {
              data: {
                relationships: {
                  author: {
                    links: {
                      self: 'http://old.example.com/api/v1/images/1/author',
                    },
                  },
                },
              },
            });

            test.equal(
              rewritten.data.relationships.author.links.self,
              'http://new.example.com/images/1/author',
              'Nested link not rewritten.');
            test.done();
          },
          regex(test) {
            test.expect(1);

            const rewritten = linker.rewriteLinks('http://new.example.com', /\/api\/v1/, {
              data: {
                relationships: {
                  author: {
                    links: {
                      self: 'http://old.example.com/api/v1/images/1/author',
                    },
                  },
                },
              },
            });

            test.equal(
              rewritten.data.relationships.author.links.self,
              'http://new.example.com/images/1/author',
              'Nested link not rewritten.');
            test.done();
          },
        },
        array: {
          string(test) {
            test.expect(1);

            const rewritten = linker.rewriteLinks('http://new.example.com', '/api/v1', {
              data: [{
                relationships: {
                  author: {
                    links: {
                      self: 'http://old.example.com/api/v1/images/1/author',
                    },
                  },
                },
              }],
            });

            test.equal(
              rewritten.data[0].relationships.author.links.self,
              'http://new.example.com/images/1/author',
              'Nested link not rewritten.');
            test.done();
          },
          regex(test) {
            test.expect(1);

            const rewritten = linker.rewriteLinks('http://new.example.com', /\/api\/v1/, {
              data: [{
                relationships: {
                  author: {
                    links: {
                      self: 'http://old.example.com/api/v1/images/1/author',
                    },
                  },
                },
              }],
            });

            test.equal(
              rewritten.data[0].relationships.author.links.self,
              'http://new.example.com/images/1/author',
              'Nested link not rewritten.');
            test.done();
          },
        },
      },
    },
    unalteredArray(test) {
      test.expect(1);

      const rewritten = linker.rewriteLinks('http://new.example.com', {
        data: {
          attributes: {
            images: [
              ['one', 'two'],
            ],
          },
        },
      });

      test.equal(rewritten.data.attributes.images[0][0], 'one', 'Array altered.');
      test.done();
    },
    unalteredObject(test) {
      test.expect(1);

      const rewritten = linker.rewriteLinks('http://new.example.com', {
        data: {
          attributes: {
            title: 'test',
          },
        },
      });

      test.equal(rewritten.data.attributes.title, 'test', 'Object altered.');
      test.done();
    },
  },
};

