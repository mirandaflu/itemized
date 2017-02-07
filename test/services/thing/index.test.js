'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('thing service', function() {
  it('registered the things service', () => {
    assert.ok(app.service('things'));
  });
});
