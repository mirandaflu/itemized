'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('collection service', function() {
  it('registered the collections service', () => {
    assert.ok(app.service('collections'));
  });
});
