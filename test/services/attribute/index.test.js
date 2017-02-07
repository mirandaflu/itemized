'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('attribute service', function() {
  it('registered the attributes service', () => {
    assert.ok(app.service('attributes'));
  });
});
